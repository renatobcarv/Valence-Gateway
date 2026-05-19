# 05 — Webhook Stripe

## O que é um webhook?

Stripe chama seu backend quando algo acontece (pagamento bem-sucedido).

```
Seu frontend           Stripe                 Seu backend
     │                   │                         │
     ├─ POST /payment    │                         │
     ├─ client secret───>│                         │
     │<──── client_secret─┤                         │
     │                   │                         │
     ├─ confirm payment  │                         │
     │─────────────────>│                         │
     │                   ├─ charge cartão         │
     │                   ├─ sucesso               │
     │                   │ POST /webhooks/stripe  │
     │                   ├───────────────────────>│
     │                   │                    CREATE payment
     │                   │                    ENQUEUE job
     │                   │<────── 200 OK ────────┤
     │<─── confirm ───────┤                         │
     │   success          │                         │
```

---

## Implementação

### Tipos (types/api.ts)

```typescript
// Stripe webhook payload
export type StripeWebhookPayload = {
  id: string;
  type: string;
  created: number;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata: Record<string, string>;
    };
  };
};

// Request type
export interface WebhookRequest {
  rawBody: Buffer; // IMPORTANTE: raw body, não parsed
  signature: string;
}
```

### Route (routes/webhooks.ts)

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { webhookController } from '../controllers';

const router = Router();

// IMPORTANTE: Este endpoint NÃO usa bodyParser JSON
// Stripe precisa do raw body pra validar assinatura

router.post('/stripe', 
  express.raw({type: 'application/json'}), // raw body
  webhookController.stripe
);

export default router;
```

### Controller (controllers/webhookController.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { stripe, prisma, splitQueue } from '../config';
import { logger } from '../utils';

export const webhookController = {
  async stripe(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      // Passo 1: Validar assinatura
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body, // raw body (Buffer)
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err: any) {
        logger.error({ err }, 'Webhook signature invalid');
        return res.status(400).json({ error: 'Signature invalid' });
      }

      logger.info({ eventId: event.id, type: event.type }, 'Webhook received');

      // Passo 2: Processar evento
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        
        // Passo 3: Validar idempotência (não processar 2x)
        const existingWebhook = await prisma.stripeWebhook.findUnique({
          where: { eventId: event.id }
        });

        if (existingWebhook?.processed) {
          logger.info({ eventId: event.id }, 'Webhook already processed');
          return res.json({ received: true });
        }

        // Passo 4: Criar payment record
        const payment = await prisma.payment.create({
          data: {
            projectId: paymentIntent.metadata.projectId,
            amount: new Decimal(paymentIntent.amount / 100), // centavos → reais
            currency: 'BRL',
            stripeId: paymentIntent.id,
            status: 'completed',
            metadata: {
              customerEmail: paymentIntent.charges?.data?.[0]?.billing_details?.email
            }
          }
        });

        // Passo 5: Registrar webhook (auditoria + idempotência)
        await prisma.stripeWebhook.create({
          data: {
            paymentId: payment.id,
            eventId: event.id,
            type: event.type,
            payload: event,
            processed: true
          }
        });

        // Passo 6: Enfileira job assíncrono
        await splitQueue.add('calculateSplits', {
          paymentId: payment.id
        }, {
          priority: 1,
          attempts: 3,
          delay: 0
        });

        logger.info(
          { 
            paymentId: payment.id, 
            amount: payment.amount.toString(),
            projectId: paymentIntent.metadata.projectId
          },
          'Payment processed, job enqueued'
        );
      }

      // Retorna sucesso ao Stripe
      return res.json({ received: true });
    } catch (err) {
      logger.error({ err }, 'Webhook error');
      return res.status(500).json({ error: 'Internal error' });
    }
  }
};
```

### Middleware (Importante!)

Express precisa de raw body pra validação Stripe:

```typescript
// server.ts

import express from 'express';

const app = express();

// Webhook ANTES do bodyParser
app.post('/webhooks/stripe', 
  express.raw({type: 'application/json'}), 
  webhookRoutes
);

// Depois, bodyParser normal
app.use(express.json());

// Resto das routes
app.use('/api', apiRoutes);
```

---

## Segurança: Validar Assinatura

### Por que?

Stripe envia um header `stripe-signature` que contém:
- Timestamp (`t=...`)
- Versão da assinatura (`v1=...`)

Você valida com sua `STRIPE_WEBHOOK_SECRET` pra garantir que foi Stripe quem enviou.

### Como funciona

```
Stripe gera:
signature = HMAC-SHA256(
  timestamp.payload,
  STRIPE_WEBHOOK_SECRET
)

Seu backend valida:
constructEvent(rawBody, signature, secret)
  ↓
Se assinatura inválida → throw error
Se assinatura válida → retorna event object
```

---

## Idempotência: Não processar 2x

Webhooks podem chegar 2x (conexão instável, retry automático Stripe).

**Solução:** Unique constraint em `eventId`

```typescript
// Primeira vez: INSERT
INSERT INTO stripe_webhooks (event_id, ...) 
VALUES ('evt_123', ...)
// SUCCESS

// Segunda vez: INSERT com mesmo event_id
INSERT INTO stripe_webhooks (event_id, ...)
VALUES ('evt_123', ...)
// ERROR: Unique constraint violation

// Seu código:
if (existingWebhook?.processed) {
  return res.json({ received: true }); // OK, já processado
}
```

---

## Flow Passo a Passo

### 1. Frontend faz pagamento
```
Open Design → Stripe.confirmCardPayment(clientSecret)
```

### 2. Stripe cobra cartão
```
Stripe API processa pagamento
Status: succeeded
```

### 3. Stripe envia webhook
```
POST http://seu-backend:3001/webhooks/stripe
Headers: {
  'stripe-signature': 't=1234567890,v1=abcdef...'
}
Body: {
  "id": "evt_123",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_stripe123",
      "amount": 10000,  // em centavos
      "currency": "brl",
      "metadata": { "projectId": "proj_abc" }
    }
  }
}
```

### 4. Seu backend recebe e valida
```typescript
// 1. Validar assinatura
stripe.webhooks.constructEvent(...)
// Se inválido → 400 error

// 2. Validar idempotência
SELECT * FROM stripe_webhooks WHERE event_id = 'evt_123'
// Se existe e processed=true → return 200

// 3. Criar payment record
INSERT INTO payments (project_id, amount, stripe_id, status)
VALUES ('proj_abc', 100.00, 'pi_stripe123', 'completed')

// 4. Enfileira job
Bull queue.add('calculateSplits', {paymentId: ...})

// 5. Return 200
```

### 5. Job processa split
```typescript
// Job: calculateSplits executa
// Busca collaborators
// Calcula percentuais
// Cria split records
// Enfileira transferQueue
```

### 6. Transfer disparado
```typescript
// Job: sendTransfer executa (pra cada split)
// Chama Pagar.me API
// Dispara Pix/TED
// Atualiza status
// Envia email
```

---

## Testando Webhook Local

### Com Stripe CLI

```bash
# 1. Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Listen locally
stripe listen --forward-to localhost:3001/webhooks/stripe

# Output:
# > Ready! Your webhook signing secret is whsec_test_...

# Copiar pra .env.local:
STRIPE_WEBHOOK_SECRET=whsec_test_...

# 4. Em outro terminal, trigger manual
stripe trigger payment_intent.succeeded

# Seu backend vai receber e processar
```

### Logs
```
2026-05-02T10:00:00Z INFO: Webhook received {eventId: "evt_...", type: "payment_intent.succeeded"}
2026-05-02T10:00:00Z INFO: Payment processed {paymentId: "pay_...", amount: "100.00"}
2026-05-02T10:00:01Z INFO: Job enqueued {jobId: "...", type: "calculateSplits"}
```

---

## Errors e Tratamento

### Signature Invalid
```
⚠️ Stripe envia webhook com signature inválida (ataque?)
✅ Você valida e retorna 400
✅ Stripe recebe 400, assume falha, tenta novamente
```

### Database Error
```
⚠️ Payment record não cria (constraint violation, banco down, etc)
✅ Você trata o erro
✅ Retorna 500 ao Stripe
✅ Stripe recebe 500, tenta novamente (exponential backoff)
```

### Job Enqueue Fails
```
⚠️ Redis down, Bull não consegue enfileirar job
✅ Você trata o erro
✅ Retorna 500
✅ Stripe tenta novamente
```

**Princípio:** Se algo errar, retorna status >= 500. Stripe tenta novamente com backoff.

---

## Tipo de Eventos

Você cuida do `payment_intent.succeeded`, mas Stripe envia outros:

```
payment_intent.succeeded     ← Você processa este
charge.refunded              ← Refund (v2.0)
charge.dispute.created       ← Chargeback (v2.0)
customer.subscription.created ← Recorrência (v2.0)
```

Por enquanto, ignora o resto.

---

## Security Checklist

- ✅ Validar assinatura Stripe (`constructEvent`)
- ✅ Usar raw body, não parsed JSON
- ✅ Unique constraint em `eventId` (idempotência)
- ✅ Não confiar em `metadata` (user pode falsificar em sandbox)
- ✅ Verificar `projectId` existe antes de usar
- ✅ Log de todos webhooks (auditoria)
- ✅ Timeout de job (5 segundos max)
- ✅ Retry automático com backoff

---

## Próximo Passo

Abra **[06_JOBS.md](06_JOBS.md)** e entenda o processamento assíncrono.
