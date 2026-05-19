# 03 — Banco de Dados

## Schema Prisma (schema.prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// Users
// ============================================
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  
  // Bank info pra receber transferências
  bankInfo  Json?     // {type: "pix"|"account", key: "email@pix"}
  
  // Timestamps
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Relations
  projects      Project[]
  collaborations Collaborator[]
  
  @@map("users")
}

// ============================================
// Projects (projetos de split)
// ============================================
model Project {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name      String
  description String?
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Relations
  collaborators Collaborator[]
  payments      Payment[]
  
  @@index([userId])
  @@map("projects")
}

// ============================================
// Collaborators (pessoas que dividem)
// ============================================
model Collaborator {
  id        String    @id @default(cuid())
  projectId String
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  email     String
  name      String
  percentage Decimal   @db.Decimal(5, 2)  // 0.00 a 100.00
  
  // Bank info
  bankInfo  Json?     // {type: "pix"|"account", key: "..."}
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Relations
  splits    Split[]
  transfers Transfer[]
  
  // Constraints
  @@unique([projectId, email])
  @@index([projectId])
  @@map("collaborators")
}

// ============================================
// Payments (pagamentos recebidos)
// ============================================
model Payment {
  id        String    @id @default(cuid())
  projectId String
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  amount    Decimal   @db.Decimal(12, 2)
  currency  String    @default("BRL")
  
  // Stripe
  stripeId  String    @unique
  status    String    @default("pending")  // pending, completed, failed
  
  metadata  Json?     // {customerEmail, customerName, ...}
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Relations
  splits    Split[]
  webhookEvents StripeWebhook[]
  
  @@index([projectId])
  @@index([status])
  @@map("payments")
}

// ============================================
// Splits (divisão de pagamento)
// ============================================
model Split {
  id              String    @id @default(cuid())
  paymentId       String
  payment         Payment   @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  
  collaboratorId  String
  collaborator    Collaborator @relation(fields: [collaboratorId], references: [id], onDelete: Cascade)
  
  amount          Decimal   @db.Decimal(12, 2)  // quanto colab vai receber
  status          String    @default("pending")  // pending, transferred, failed
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations (1-to-1)
  transfer        Transfer?
  
  @@index([paymentId])
  @@index([collaboratorId])
  @@index([status])
  @@map("splits")
}

// ============================================
// Transfers (Pix/TED disparado)
// ============================================
model Transfer {
  id              String    @id @default(cuid())
  splitId         String    @unique
  split           Split     @relation(fields: [splitId], references: [id], onDelete: Cascade)
  
  collaboratorId  String
  collaborator    Collaborator @relation(fields: [collaboratorId], references: [id], onDelete: Cascade)
  
  method          String    // "pix" ou "ted"
  amount          Decimal   @db.Decimal(12, 2)
  status          String    @default("pending")  // pending, processing, completed, failed
  
  // External reference (Pagar.me)
  externalId      String?   
  externalStatus  String?   
  errorMessage    String?   
  
  createdAt       DateTime  @default(now())
  completedAt     DateTime?
  
  // Retry
  retryCount      Int       @default(0)
  lastRetryAt     DateTime?
  
  @@index([collaboratorId])
  @@index([status])
  @@map("transfers")
}

// ============================================
// Stripe Webhooks (audit trail)
// ============================================
model StripeWebhook {
  id        String    @id @default(cuid())
  
  paymentId String?
  payment   Payment?  @relation(fields: [paymentId], references: [id], onDelete: SetNull)
  
  eventId   String    @unique
  type      String    // "payment_intent.succeeded"
  payload   Json      // Full webhook payload
  processed Boolean   @default(false)
  
  createdAt DateTime  @default(now())
  
  @@index([eventId])
  @@index([processed])
  @@map("stripe_webhooks")
}
```

---

## Relacionamentos (Visual)

```
User (1)
  ├─→ (N) Projects (1 user, múltiplos projetos)
  │       └─→ (N) Collaborators
  │           ├─→ (N) Splits
  │           │   └─→ (1) Transfer
  │           └─→ (N) Transfers
  └─→ (N) Collaborations (quando colab em projeto de outro)

Payment (1)
  └─→ (N) Splits (1 pagamento, múltiplos colaboradores)
      └─→ (1) Transfer (cada split → 1 transfer)
```

---

## RLS (Row Level Security)

Garante que user vê **só seus dados**.

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Policy: User vê só suas projects
CREATE POLICY "users_see_own_projects" ON projects
  FOR ALL USING (auth.uid()::text = user_id);

-- Policy: User vê collaborators de seus projetos OU se é collaborator
CREATE POLICY "users_see_collaborators" ON collaborators
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()::text)
    OR
    email = auth.email()
  );

-- Policy: User vê splits de seus projetos
CREATE POLICY "users_see_splits" ON splits
  FOR ALL USING (
    payment_id IN (
      SELECT id FROM payments 
      WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()::text)
    )
    OR
    collaborator_id IN (SELECT id FROM collaborators WHERE email = auth.email())
  );

-- Policy: User vê transfers que recebeu
CREATE POLICY "users_see_own_transfers" ON transfers
  FOR ALL USING (
    collaborator_id IN (
      SELECT id FROM collaborators WHERE email = auth.email()
    )
  );
```

---

## Índices (Performance)

```prisma
// Já definidos no schema acima, mas visualização:

@@index([userId])             // projects.user_id
@@index([projectId])          // collaborators, payments
@@index([paymentId])          // splits
@@index([collaboratorId])     // splits, transfers
@@index([status])             // queries por status
@@index([eventId])            // webhook deduplication
```

---

## Tipos TypeScript (Auto-gerado pelo Prisma)

```typescript
// Prisma auto-gera esses tipos:
import {
  User,
  Project,
  Collaborator,
  Payment,
  Split,
  Transfer,
  StripeWebhook
} from '@prisma/client';

// Você usa assim:
async function getProject(id: string): Promise<Project | null> {
  return prisma.project.findUnique({
    where: { id },
    include: {
      collaborators: true,
      payments: { include: { splits: true } }
    }
  });
}
```

---

## Dados de Exemplo

### User
```json
{
  "id": "user_123",
  "email": "joao@example.com",
  "name": "João",
  "bankInfo": {
    "type": "pix",
    "key": "joao@example.com"
  }
}
```

### Project
```json
{
  "id": "proj_abc",
  "userId": "user_123",
  "name": "Podcast XYZ",
  "description": "Podcast semanal",
  "createdAt": "2026-05-01T10:00:00Z"
}
```

### Collaborators
```json
[
  {
    "id": "colab_1",
    "projectId": "proj_abc",
    "email": "joao@example.com",
    "name": "João",
    "percentage": "70.00",
    "bankInfo": {"type": "pix", "key": "joao@example.com"}
  },
  {
    "id": "colab_2",
    "projectId": "proj_abc",
    "email": "maria@example.com",
    "name": "Maria",
    "percentage": "20.00",
    "bankInfo": {"type": "pix", "key": "maria@example.com"}
  },
  {
    "id": "colab_3",
    "projectId": "proj_abc",
    "email": "pedro@example.com",
    "name": "Pedro",
    "percentage": "10.00",
    "bankInfo": {"type": "account", "key": "pedro_123"}
  }
]
```

### Payment → Splits → Transfers
```json
{
  "payment": {
    "id": "pay_123",
    "projectId": "proj_abc",
    "amount": "100.00",
    "currency": "BRL",
    "stripeId": "pi_stripe123",
    "status": "completed"
  },
  "splits": [
    {
      "id": "split_1",
      "paymentId": "pay_123",
      "collaboratorId": "colab_1",
      "amount": "70.00",
      "status": "transferred"
    },
    {
      "id": "split_2",
      "paymentId": "pay_123",
      "collaboratorId": "colab_2",
      "amount": "20.00",
      "status": "transferred"
    },
    {
      "id": "split_3",
      "paymentId": "pay_123",
      "collaboratorId": "colab_3",
      "amount": "10.00",
      "status": "transferred"
    }
  ],
  "transfers": [
    {
      "id": "trans_1",
      "splitId": "split_1",
      "collaboratorId": "colab_1",
      "method": "pix",
      "amount": "70.00",
      "status": "completed",
      "externalId": "pix_ext_123",
      "completedAt": "2026-05-02T10:05:00Z"
    },
    // ... mais 2 transfers
  ]
}
```

---

## Migrations (Versionadas em Git)

```bash
# Primeira vez: criar schema
npx prisma migrate dev --name init

# Cria arquivo:
# prisma/migrations/20260501100000_init/migration.sql

# Próximas mudanças:
npx prisma migrate dev --name add_field_xyz

# Cada migration é um arquivo versionado
```

**Importância:**
- Migrations vão pra Git (histórico de mudanças)
- Deploy automático executa pendentes
- Zero "manuel SQL" em produção

---

## Setup Local (Supabase)

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# Inicializar
supabase init

# Start local
supabase start

# Output do terminal:
# API URL: http://localhost:54321
# Anon Key: eyJ...
# Service Role Key: eyJ...
# Database: postgresql://postgres:postgres@localhost:54322/postgres

# Copiar DATABASE_URL pro .env.local:
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Rodar migrations
npx prisma migrate dev

# Acessar interface (opcional)
supabase link --project-ref seu_id
npx prisma studio
```

---

## Constraints Importantes

| Constraint | Campo | Razão |
|---|---|---|
| `UNIQUE(projectId, email)` | collaborators | Um colab não pode aparecer 2x no mesmo projeto |
| `UNIQUE(stripeId)` | payments | Um payment intent Stripe não pode processar 2x |
| `UNIQUE(eventId)` | stripe_webhooks | Webhook não processa 2x (idempotência) |
| `UNIQUE(splitId)` | transfers | Um split → uma transfer |
| `NOT NULL userId` | projects | Projeto sempre tem dono |
| `NOT NULL amount` | payments, splits, transfers | Valores sempre preenchidos |

---

## Próximo Passo

Abra **[04_ENDPOINTS.md](04_ENDPOINTS.md)** e veja os endpoints REST.
