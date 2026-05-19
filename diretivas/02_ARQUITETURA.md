# 02 — Arquitetura

## Stack Backend Completo

```
┌─────────────────────────────────────────────────────┐
│ Frontend: Open Design (você consome via HTTP)      │
│ (não faz parte dessa especificação)                 │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────┐
│ BACKEND (Este projeto)                              │
│                                                     │
│ Express.js (Node.js 22)                            │
│ TypeScript + Zod + Prisma                          │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Routes/Controllers/Services                 │   │
│ │ (endpoints REST)                            │   │
│ └────────────┬────────────────────────────────┘   │
│              │                                     │
│ ┌────────────▼────────────────────────────────┐   │
│ │ PostgreSQL (Supabase)                       │   │
│ │ (8 tabelas, RLS, indexes)                   │   │
│ └────────────┬────────────────────────────────┘   │
│              │                                     │
│ ┌────────────▼────────────────────────────────┐   │
│ │ Redis (Upstash)                             │   │
│ │ Bull Queue                                  │   │
│ │ (async jobs)                                │   │
│ └────────────┬────────────────────────────────┘   │
│              │                                     │
│ ┌────────────▼────────────────────────────────┐   │
│ │ Jobs:                                       │   │
│ │ - calculateSplits                           │   │
│ │ - sendTransfer (Pagar.me)                   │   │
│ │ - sendEmail                                 │   │
│ └─────────────────────────────────────────────┘   │
└──────────┬─────────────────┬──────────────┬────────┘
           │                 │              │
           ▼                 ▼              ▼
    ┌────────────┐    ┌──────────────┐  ┌──────────┐
    │ Stripe API │    │ Pagar.me API │  │ Supabase │
    │ (webhooks) │    │ (Pix/TED)    │  │ (Auth)   │
    └────────────┘    └──────────────┘  └──────────┘
```

---

## Estrutura de Pastas

```
backend/
├── src/
│   ├── server.ts                    # Express app setup
│   │
│   ├── config/
│   │   ├── env.ts                   # Environment variables (Zod validated)
│   │   ├── stripe.ts                # Stripe client
│   │   ├── pagarme.ts               # Pagar.me client
│   │   └── redis.ts                 # Redis connection
│   │
│   ├── routes/
│   │   ├── index.ts                 # Router aggregator
│   │   ├── auth.ts                  # POST /auth/register, /login
│   │   ├── projects.ts              # POST/GET /projects
│   │   ├── collaborators.ts         # POST /projects/:id/collaborators
│   │   ├── payments.ts              # POST /projects/:id/create-payment
│   │   ├── dashboard.ts             # GET /dashboard/earnings, transfers
│   │   └── webhooks.ts              # POST /webhooks/stripe
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── projectController.ts
│   │   ├── paymentController.ts
│   │   └── webhookController.ts
│   │
│   ├── services/
│   │   ├── authService.ts           # Password hash, JWT
│   │   ├── projectService.ts        # CRUD projetos
│   │   ├── stripeService.ts         # Payment intent, charge
│   │   ├── splitService.ts          # Calcular divisão (70%, 20%, etc)
│   │   ├── transferService.ts       # Pix/TED via Pagar.me
│   │   └── emailService.ts          # Sendgrid ou SMTP
│   │
│   ├── middleware/
│   │   ├── auth.ts                  # JWT verification
│   │   ├── errorHandler.ts          # Error catching
│   │   ├── validation.ts            # Zod middleware
│   │   └── cors.ts                  # CORS config
│   │
│   ├── jobs/
│   │   ├── queues.ts                # Bull queues setup
│   │   ├── splitQueue.ts            # Job: calculateSplits
│   │   ├── transferQueue.ts         # Job: sendTransfer
│   │   ├── notificationQueue.ts     # Job: sendEmail
│   │   └── handlers.ts              # Job processors
│   │
│   ├── types/
│   │   ├── index.ts                 # Global types
│   │   └── api.ts                   # API request/response types
│   │
│   ├── utils/
│   │   ├── logger.ts                # Pino logger
│   │   ├── errors.ts                # Custom error classes
│   │   ├── validators.ts            # Zod schemas
│   │   └── helpers.ts               # Utility functions
│   │
│   └── prisma/
│       ├── schema.prisma            # Database schema
│       └── seed.ts                  # Seed data
│
├── tests/
│   ├── unit/
│   │   ├── services.test.ts
│   │   └── utils.test.ts
│   └── integration/
│       ├── auth.test.ts
│       ├── payments.test.ts
│       └── webhooks.test.ts
│
├── prisma/
│   ├── schema.prisma                # Link simbólico ou arquivo
│   └── migrations/                  # Versionadas em Git
│
├── .env.example
├── .env.local
├── .env.production
├── package.json
├── tsconfig.json
├── jest.config.js
├── prettier.config.js
├── .eslintrc.json
├── Dockerfile                       # Deploy
├── docker-compose.yml               # Local dev
└── README.md
```

---

## Fluxo de Dados (Completo)

### 1️⃣ Autenticação

```
User (Open Design)
    ↓
POST /auth/register
{email, password, name}
    ↓
Backend authController.register()
    ├─ Zod validate input
    ├─ Hash password (bcrypt)
    ├─ Prisma create user
    ├─ Generate JWT (Supabase)
    └─ Return {user, token}
    ↓
Open Design armazena JWT (localStorage/cookie)
```

### 2️⃣ Criar Projeto

```
User (autenticado)
    ↓
POST /projects
{name, description}
(Authorization: Bearer JWT)
    ↓
Backend projectController.create()
    ├─ Middleware verifica JWT
    ├─ Zod validate input
    ├─ Prisma create project
    │  (user_id = JWT.sub)
    └─ Return {id, paymentLink}
    ↓
Frontend copia link e compartilha
```

### 3️⃣ Adicionar Colaboradores

```
User (owner do projeto)
    ↓
POST /projects/:id/collaborators
{email, name, percentage, bankInfo}
    ↓
Backend collaboratorController.add()
    ├─ Zod validate
    ├─ Valida percentuais (sum <= 100)
    ├─ Prisma create collaborator
    └─ Return collaborator
```

### 4️⃣ Gerar Link de Pagamento

```
Customer (público)
    ↓
GET /projects/:id  (informações do projeto)
    ↓
Backend retorna:
{name, collaborators, stripePublishableKey}
    ↓
Open Design renderiza Stripe checkout
    ↓
Customer preenche cartão
    ↓
POST /projects/:id/create-payment
{amount, currency}
    ↓
Backend stripeService.create_payment_intent()
    ├─ Stripe.paymentIntents.create()
    └─ Return {clientSecret}
    ↓
Open Design usa clientSecret pra processar
```

### 5️⃣ Pagamento Processado

```
Customer clica "Pagar R$100"
    ↓
Open Design (Stripe Elements)
stripe.confirmCardPayment(clientSecret)
    ↓
Stripe cobra cartão
    ↓
Stripe envia webhook:
POST http://seu-backend/webhooks/stripe
{
  type: "payment_intent.succeeded",
  data: {object: {id: "pi_xxx", amount: 10000, ...}}
}
```

### 6️⃣ Backend Processa Webhook

```
Webhook chega
    ↓
webhookController.stripe()
    ├─ Valida signature (Stripe secret)
    ├─ Prisma create payment record
    │  (amount=100.00, status=completed)
    ├─ Verifica idempotência (event_id unique)
    └─ Enfileira job: calculateSplits
    ↓
Return 200 OK (ao Stripe)
```

### 7️⃣ Split Calculation (Async Job)

```
Bull job: calculateSplits
    ↓
splitQueue processor
    ├─ Busca payment + project + collaborators
    ├─ Para cada collaborator:
    │  ├─ amount_to_pay = 100 * (percentage / 100)
    │  ├─ Prisma create split record
    │  └─ Enfileira transferQueue
    └─ Done
```

**Exemplo:**
```
Payment: R$100
Collaborators:
  - João 70% → R$70
  - Maria 20% → R$20
  - Pedro 10% → R$10
```

### 8️⃣ Transfer (Async Job)

```
Bull job: sendTransfer (pra cada split)
    ↓
transferQueue processor
    ├─ Busca split + collaborator + bankInfo
    ├─ Chama Pagar.me API:
    │  POST /transfer {
    │    amount: 7000 (em centavos),
    │    pix_key: "joao@email.com",
    │    external_id: split_id
    │  }
    ├─ Prisma update transfer
    │  (status=completed, external_id=pix_xxx)
    └─ Enfileira notificationQueue
```

### 9️⃣ Notificação (Async Job)

```
Bull job: sendEmail
    ↓
notificationQueue processor
    ├─ Renderiza email template
    ├─ Envia via SendGrid/SMTP
    │  "João, você recebeu R$70 do projeto Podcast XYZ"
    └─ Done
```

### 🔟 Dashboard (Realtime)

```
Open Design subscreveu Supabase Realtime

Quando Prisma criou transfer record:
    ↓
Supabase broadcast: "new transfer"
    ↓
Open Design recebe via WebSocket
    ↓
React state atualiza
    ↓
Dashboard mostra: "Você recebeu R$70" em tempo real
```

---

## Componentes Críticos

### JWT Token
```typescript
Header: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Payload (decoded):
{
  sub: "user_uuid",
  email: "user@example.com",
  iat: 1234567890,
  exp: 1234571490  // 1 hora depois
}
```

### Webhook Validation
```typescript
// Stripe envia header:
stripe-signature: t=1234567890,v1=abcdef123456...

// Backend verifica:
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
// Se inválido = throw error
```

### Idempotência
```typescript
// Mesmo webhook pode chegar 2x
// Solução: unique constraint em event_id

INSERT INTO stripe_webhooks (event_id, ...) VALUES ('evt_xxx', ...)
// Segunda vez = UNIQUE constraint error = ignorar
```

---

## Segurança

| Camada | Proteção |
|--------|----------|
| **Input** | Zod validation (rejeita dados inválidos) |
| **Auth** | JWT (expira em 1h, refresh token) |
| **Webhooks** | Stripe signature validation |
| **Database** | RLS policies (user vê só seus dados) |
| **Secrets** | Environment variables (.env.local) |
| **CORS** | Permitir só Open Design frontend |
| **Rate limit** | 100 req/min por IP |

---

## Performance

| Otimização | Implementação |
|---|---|
| **Database indexes** | Foreign keys, status columns |
| **Caching** | Redis pra project metadata (TTL 1h) |
| **Job processing** | Bull com 8 workers (não bloqueia) |
| **Logging** | Pino JSON (não usa console.log) |
| **Connection pooling** | Prisma auto-gerencia |

---

## Deployment Architecture

```
┌──────────────────────────────────┐
│ GitHub (seu repositório)         │
│ (push → trigger deploy)          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Railway (CI/CD automático)       │
│ ├─ Pull código                   │
│ ├─ npm install                   │
│ ├─ npm run build                 │
│ ├─ npm run migrate               │
│ └─ npm run start                 │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Production Environment           │
│ ├─ Node.js 22 + Express          │
│ ├─ PostgreSQL (Supabase)         │
│ ├─ Redis (Upstash)               │
│ ├─ Bull workers (rodando)        │
│ └─ HTTPS + custom domain         │
└──────────────────────────────────┘
```

---

## Decisões de Design

### Por que Express (não NestJS, FastAPI, etc)?
- Simples, bem documentado
- Sem overhead de decorators
- Fácil testar
- Você entende cada linha

### Por que Prisma (não Sequelize, TypeORM)?
- Type-safe queries (zero `any`)
- Migrations automáticas e versionadas
- Studio visual (debugging)
- Excelente Supabase integration

### Por que Bull (não Celery, RabbitMQ)?
- JavaScript nativo (sem linguagem extra)
- Redis simples de usar
- Retry automático
- Perfect pro case use (não high-throughput finance)

### Por que Supabase (não Firebase, MongoDB)?
- PostgreSQL (SQL, não NoSQL)
- RLS built-in
- Auth + Database + Realtime
- Free tier robusto

---

## Próximo Passo

Abra **[03_BANCO.md](03_BANCO.md)** e entenda o schema.
