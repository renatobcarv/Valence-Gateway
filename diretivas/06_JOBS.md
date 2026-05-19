# 06 — Jobs (Bull + Redis)

## Por que async jobs?

Depois que webhook chega, você precisa:
1. Calcular divisão (70%, 20%, 10%)
2. Disparar 3x Pix/TED (pode falhar)
3. Enviar 3x email

**Problema:** Se fizer tudo síncrono, webhook leva 10+ segundos. Stripe vai dar timeout.

**Solução:** Enfileira jobs assíncrono. Webhook retorna em 200ms.

```
Webhook recebe
  ├─ Cria payment record (100ms)
  ├─ Enfileira job (10ms)
  └─ Return 200 OK (110ms total)

Depois, assincronamente:
  ├─ Job 1: calculateSplits (5s)
  ├─ Job 2-4: sendTransfer (20s cada, em paralelo)
  └─ Job 5-7: sendEmail (2s cada, em paralelo)
```

---

## Setup Bull + Redis

### Instalar
```bash
npm install bull redis ioredis
```

### Redis Connection (config/redis.ts)

```typescript
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});
```

### .env.local
```
REDIS_URL=redis://localhost:6379
```

Ou em produção (Upstash):
```
REDIS_URL=redis://default:password@host:port
```

---

## Queues Setup (jobs/queues.ts)

```typescript
import Queue from 'bull';
import { redis } from '../config/redis';

export const splitQueue = new Queue('calculateSplits', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000 // 2s, 4s, 8s
    },
    removeOnComplete: true
  }
});

export const transferQueue = new Queue('sendTransfer', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: false // Manter histórico
  }
});

export const notificationQueue = new Queue('sendEmail', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 }
  }
});
```

---

## Job 1: Calculate Splits

**Quando:** Logo após webhook processar pagamento

**O que faz:** Calcula divisão, cria split records, enfileira transfers

### Handler (jobs/handlers/calculateSplits.ts)

```typescript
import { splitQueue, transferQueue } from '../queues';
import { prisma } from '../../db';
import { logger } from '../../utils';
import Decimal from 'decimal.js';

splitQueue.process(async (job) => {
  const { paymentId } = job.data;

  logger.info({ paymentId }, 'Processing calculateSplits');

  try {
    // 1. Busca payment + project + collaborators
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        project: {
          include: {
            collaborators: true
          }
        }
      }
    });

    if (!payment || !payment.project) {
      throw new Error('Payment or project not found');
    }

    const { amount } = payment;
    const { collaborators } = payment.project;

    // 2. Validate: soma de percentuais = 100
    const totalPercentage = collaborators.reduce((sum, c) => {
      return sum + parseFloat(c.percentage.toString());
    }, 0);

    if (totalPercentage !== 100) {
      throw new Error(`Invalid percentages: ${totalPercentage}%`);
    }

    // 3. Cria splits
    const splits = await Promise.all(
      collaborators.map((colab) => {
        const splitAmount = new Decimal(amount.toString())
          .times(colab.percentage)
          .dividedBy(100);

        return prisma.split.create({
          data: {
            paymentId,
            collaboratorId: colab.id,
            amount: splitAmount,
            status: 'pending'
          }
        });
      })
    );

    logger.info(
      { paymentId, splitCount: splits.length },
      'Splits created'
    );

    // 4. Enfileira transfer job pra cada split
    for (const split of splits) {
      await transferQueue.add('sendTransfer', {
        splitId: split.id
      }, {
        priority: 1,
        delay: 2000 // aguarda 2s antes de disparar
      });
    }

    logger.info(
      { paymentId, transfersQueued: splits.length },
      'Transfer jobs enqueued'
    );

    return {
      success: true,
      splitsCreated: splits.length
    };
  } catch (err) {
    logger.error({ err, paymentId }, 'calculateSplits failed');
    throw err; // Bull vai retry
  }
});
```

---

## Job 2: Send Transfer (Pagar.me)

**Quando:** Enfileirado por calculateSplits (1 por collaborador)

**O que faz:** Dispara Pix/TED via Pagar.me, atualiza status, enfileira email

### Handler (jobs/handlers/sendTransfer.ts)

```typescript
import { transferQueue, notificationQueue } from '../queues';
import { prisma } from '../../db';
import { pagarmeService } from '../../services';
import { logger } from '../../utils';

transferQueue.process(8, async (job) => { // 8 workers paralelos
  const { splitId } = job.data;

  logger.info({ splitId, attempt: job.attemptsMade }, 'Processing sendTransfer');

  try {
    // 1. Busca split + collaborator + payment
    const split = await prisma.split.findUnique({
      where: { id: splitId },
      include: {
        collaborator: true,
        payment: {
          include: { project: true }
        }
      }
    });

    if (!split || !split.collaborator) {
      throw new Error('Split or collaborator not found');
    }

    const { amount, collaborator, payment } = split;

    logger.info(
      { splitId, collaboratorEmail: collaborator.email, amount: amount.toString() },
      'Initiating transfer'
    );

    // 2. Valida bankInfo
    if (!collaborator.bankInfo || !collaborator.bankInfo.type || !collaborator.bankInfo.key) {
      throw new Error('Collaborator bank info missing');
    }

    // 3. Dispara Pagar.me (Pix ou TED)
    const transferResponse = await pagarmeService.createTransfer({
      amount: Math.round(parseFloat(amount.toString()) * 100), // reais → centavos
      type: collaborator.bankInfo.type,
      key: collaborator.bankInfo.key,
      externalId: splitId
    });

    logger.info(
      { splitId, externalId: transferResponse.id },
      'Transfer created in Pagar.me'
    );

    // 4. Cria transfer record com sucesso
    const transfer = await prisma.transfer.create({
      data: {
        splitId,
        collaboratorId: collaborator.id,
        method: collaborator.bankInfo.type,
        amount,
        status: 'completed',
        externalId: transferResponse.id,
        externalStatus: transferResponse.status,
        completedAt: new Date(),
        retryCount: job.attemptsMade
      }
    });

    // 5. Atualiza split como transferred
    await prisma.split.update({
      where: { id: splitId },
      data: { status: 'transferred' }
    });

    logger.info({ splitId, transferId: transfer.id }, 'Transfer completed');

    // 6. Enfileira email de confirmação
    await notificationQueue.add('sendEmail', {
      email: collaborator.email,
      type: 'transfer_completed',
      metadata: {
        amount: amount.toString(),
        projectName: payment.project.name,
        method: collaborator.bankInfo.type,
        externalId: transferResponse.id
      }
    });

    return {
      success: true,
      transferId: transfer.id
    };
  } catch (err: any) {
    logger.error(
      { err: err.message, splitId, attempt: job.attemptsMade },
      'sendTransfer failed'
    );

    // Registra falha (pra retry)
    await prisma.transfer.create({
      data: {
        splitId,
        collaboratorId: (await prisma.split.findUnique({
          where: { id: splitId }
        }))!.collaboratorId,
        method: 'pix', // default
        amount: (await prisma.split.findUnique({
          where: { id: splitId }
        }))!.amount,
        status: 'failed',
        errorMessage: err.message,
        retryCount: job.attemptsMade
      }
    }).catch(() => {}); // ignore se já existe

    throw err; // Bull vai retry
  }
});
```

---

## Job 3: Send Email

**Quando:** Enfileirado após transfer bem-sucedido

**O que faz:** Renderiza email, envia via SendGrid/SMTP

### Handler (jobs/handlers/sendEmail.ts)

```typescript
import { notificationQueue } from '../queues';
import { emailService } from '../../services';
import { logger } from '../../utils';

notificationQueue.process(async (job) => {
  const { email, type, metadata } = job.data;

  logger.info({ email, type }, 'Processing sendEmail');

  try {
    let subject = '';
    let htmlContent = '';

    if (type === 'transfer_completed') {
      const { amount, projectName, method } = metadata;
      
      subject = 'Você recebeu uma transferência!';
      htmlContent = `
        <h1>Parabéns!</h1>
        <p>Você recebeu <strong>R$ ${amount}</strong> do projeto <strong>${projectName}</strong>.</p>
        <p>Transferência via ${method === 'pix' ? 'Pix' : 'TED'} enviada.</p>
        <p>Pode levar alguns minutos para chegar na sua conta.</p>
        <p><a href="https://valence.app/dashboard">Ver dashboard</a></p>
      `;
    } else if (type === 'payment_received') {
      const { amount, projectName } = metadata;
      
      subject = 'Novo pagamento recebido!';
      htmlContent = `
        <h1>Novo pagamento!</h1>
        <p>Seu projeto <strong>${projectName}</strong> recebeu <strong>R$ ${amount}</strong>.</p>
        <p>As divisões foram automáticamente processadas.</p>
      `;
    }

    // Envia via SendGrid (ou SMTP)
    await emailService.send({
      to: email,
      subject,
      html: htmlContent
    });

    logger.info({ email }, 'Email sent successfully');

    return { success: true };
  } catch (err) {
    logger.error({ err, email }, 'sendEmail failed');
    throw err; // Bull vai retry
  }
});
```

---

## Inicializar Queues (jobs/index.ts)

```typescript
import './handlers/calculateSplits';
import './handlers/sendTransfer';
import './handlers/sendEmail';

export { splitQueue, transferQueue, notificationQueue } from './queues';
```

### No server.ts
```typescript
import './jobs'; // Inicializa handlers

const app = express();
// ... rest
```

---

## Job Status & Monitoring

### Queue Events

```typescript
splitQueue
  .on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Job completed');
  })
  .on('failed', (job, err) => {
    logger.error({ jobId: job.id, err }, 'Job failed');
  })
  .on('stalled', (job) => {
    logger.warn({ jobId: job.id }, 'Job stalled');
  });
```

### Ver fila (dashboard Bull)

```typescript
// npm install bull-board
import { createBullBoard } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';

const { router } = createBullBoard([
  new BullAdapter(splitQueue),
  new BullAdapter(transferQueue),
  new BullAdapter(notificationQueue)
]);

app.use('/admin/queues', router);
// Acessa em http://localhost:3001/admin/queues
```

---

## Retry Strategy

| Queue | Max Attempts | Backoff | Removido |
|-------|--|--|--|
| **splitQueue** | 3 | Exponential (2s, 4s, 8s) | Sim (ao completar) |
| **transferQueue** | 5 | Exponential (1s, 2s, 4s, 8s, 16s) | Não (auditoria) |
| **notificationQueue** | 2 | Exponential (5s, 10s) | Sim |

---

## Escalabilidade

Múltiplos workers:
```typescript
transferQueue.process(8, handler); // 8 workers paralelos
```

Com Redis, você pode rodar múltiplos processos do worker:
```bash
# Terminal 1
node dist/server.js # API rodando

# Terminal 2
node dist/worker.js # Worker 1 processando jobs

# Terminal 3
node dist/worker.js # Worker 2 processando jobs
```

Cada worker pega jobs da fila sem conflito.

---

## Próximo Passo

Abra **[07_OPEN_DESIGN.md](07_OPEN_DESIGN.md)** e veja como Open Design consome sua API.
