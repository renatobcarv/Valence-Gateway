# 04 — Endpoints

**Base URL:** `http://localhost:3001/api` (dev) ou `https://api.valence.app` (prod)

---

## 🔐 AUTH — Autenticação

### POST /auth/register

Criar conta nova.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "SecurePass123!",
  "name": "João Silva"
}
```

**Validation (Zod):**
```typescript
{
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  name: z.string().min(2).max(100)
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_123",
    "email": "joao@example.com",
    "name": "João Silva"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 400: Email já existe
- 400: Senha fraca
- 500: Server error

---

### POST /auth/login

Fazer login.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123",
    "email": "joao@example.com",
    "name": "João Silva"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 401: Email/senha inválido
- 500: Server error

---

## 🏢 PROJECTS — Gerenciar Projetos

### POST /projects

Criar novo projeto.

**Auth:** Requerido (JWT)

**Request:**
```json
{
  "name": "Podcast XYZ",
  "description": "Podcast semanal"
}
```

**Response (201):**
```json
{
  "id": "proj_abc",
  "userId": "user_123",
  "name": "Podcast XYZ",
  "description": "Podcast semanal",
  "paymentLink": "https://pay.valence.app/proj_abc",
  "createdAt": "2026-05-01T10:00:00Z"
}
```

---

### GET /projects

Listar projetos do usuário.

**Auth:** Requerido

**Query params:**
- `limit=10` (default)
- `offset=0` (default)

**Response (200):**
```json
{
  "projects": [
    {
      "id": "proj_abc",
      "name": "Podcast XYZ",
      "description": "Podcast semanal",
      "collaboratorCount": 3,
      "totalRevenue": "15000.00",
      "totalPayments": 45,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

---

### GET /projects/:id

Detalhe de um projeto.

**Auth:** Requerido (owner ou collaborator)

**Response (200):**
```json
{
  "id": "proj_abc",
  "userId": "user_123",
  "name": "Podcast XYZ",
  "description": "Podcast semanal",
  "paymentLink": "https://pay.valence.app/proj_abc",
  "collaborators": [
    {
      "id": "colab_1",
      "name": "João",
      "email": "joao@example.com",
      "percentage": "70.00",
      "totalEarned": "10500.00"
    },
    {
      "id": "colab_2",
      "name": "Maria",
      "email": "maria@example.com",
      "percentage": "20.00",
      "totalEarned": "3000.00"
    },
    {
      "id": "colab_3",
      "name": "Pedro",
      "email": "pedro@example.com",
      "percentage": "10.00",
      "totalEarned": "1500.00"
    }
  ],
  "stats": {
    "totalPayments": 45,
    "totalRevenue": "15000.00",
    "averagePayment": "333.33",
    "lastPayment": "2026-05-02T10:00:00Z"
  }
}
```

---

### PUT /projects/:id

Atualizar projeto (nome, descrição).

**Auth:** Requerido (only owner)

**Request:**
```json
{
  "name": "Podcast XYZ - Season 2",
  "description": "Nova descrição"
}
```

**Response (200):** Mesmo que GET /projects/:id

---

### DELETE /projects/:id

Deletar projeto (soft delete).

**Auth:** Requerido (only owner)

**Response (204):** No content

---

## 👥 COLLABORATORS — Gerenciar Colaboradores

### POST /projects/:projectId/collaborators

Adicionar colaborador.

**Auth:** Requerido (only project owner)

**Request:**
```json
{
  "email": "maria@example.com",
  "name": "Maria Silva",
  "percentage": 20.00,
  "bankInfo": {
    "type": "pix",
    "key": "maria@example.com"
  }
}
```

**Validation:**
```typescript
{
  email: z.string().email(),
  name: z.string().min(2).max(100),
  percentage: z.number().min(0).max(100),
  bankInfo: z.object({
    type: z.enum(["pix", "account"]),
    key: z.string().min(1)
  })
}
```

**Response (201):**
```json
{
  "id": "colab_2",
  "projectId": "proj_abc",
  "email": "maria@example.com",
  "name": "Maria Silva",
  "percentage": 20.00,
  "bankInfo": {"type": "pix", "key": "maria@example.com"},
  "createdAt": "2026-05-01T11:00:00Z"
}
```

**Errors:**
- 400: Email já colabora neste projeto
- 400: Soma de percentuais > 100%
- 404: Project não encontrado
- 403: Você não é owner

---

### GET /projects/:projectId/collaborators

Listar colaboradores.

**Auth:** Requerido (owner ou collaborator)

**Response (200):**
```json
{
  "collaborators": [
    {
      "id": "colab_1",
      "email": "joao@example.com",
      "name": "João",
      "percentage": 70.00,
      "bankInfo": {"type": "pix", "key": "joao@example.com"},
      "totalEarned": "10500.00",
      "lastTransfer": "2026-05-02T10:05:00Z"
    }
  ],
  "totalPercentage": 100.00
}
```

---

### PUT /projects/:projectId/collaborators/:collabId

Atualizar colaborador (percentage, bankInfo).

**Auth:** Requerido (only owner)

**Request:**
```json
{
  "percentage": 25.00,
  "bankInfo": {
    "type": "account",
    "key": "new_key"
  }
}
```

**Response (200):** Updated collaborator object

---

### DELETE /projects/:projectId/collaborators/:collabId

Remover colaborador.

**Auth:** Requerido (only owner)

**Response (204):** No content

---

## 💳 PAYMENTS — Pagamentos

### POST /projects/:projectId/create-payment

Criar payment intent Stripe.

**Auth:** Não requerido (público)

**Request:**
```json
{
  "amount": 100.00,
  "customerEmail": "customer@example.com",
  "customerName": "Customer"
}
```

**Validation:**
```typescript
{
  amount: z.number().min(0.50),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional()
}
```

**Response (201):**
```json
{
  "clientSecret": "pi_123_secret_456",
  "paymentIntentId": "pi_123",
  "amount": 100.00,
  "currency": "BRL",
  "status": "requires_payment_method",
  "stripePublishableKey": "pk_live_..."
}
```

**Frontend usa `clientSecret` pra renderizar Stripe checkout.**

---

### GET /payments

Listar pagamentos dos projetos do usuário.

**Auth:** Requerido

**Query params:**
- `projectId` (filtro)
- `status` (pending, completed, failed)
- `limit=20`
- `offset=0`

**Response (200):**
```json
{
  "payments": [
    {
      "id": "pay_123",
      "projectId": "proj_abc",
      "amount": "100.00",
      "currency": "BRL",
      "status": "completed",
      "stripeId": "pi_stripe123",
      "createdAt": "2026-05-02T10:00:00Z",
      "splits": [
        {"collaboratorName": "João", "amount": "70.00"},
        {"collaboratorName": "Maria", "amount": "20.00"},
        {"collaboratorName": "Pedro", "amount": "10.00"}
      ]
    }
  ],
  "total": 45
}
```

---

## 📊 DASHBOARD — Ganhos e Histórico

### GET /dashboard/earnings

Ganhos do usuário (como owner + collaborator).

**Auth:** Requerido

**Response (200):**
```json
{
  "asOwner": {
    "totalRevenue": "50000.00",
    "totalProjects": 2,
    "totalPayments": 120,
    "averagePayment": "416.67"
  },
  "asCollaborator": {
    "totalEarned": "8000.00",
    "collaboratingIn": 3,
    "totalTransfers": 45,
    "averageTransfer": "177.78"
  },
  "combined": {
    "totalEarnings": "58000.00",
    "lastTransactionDate": "2026-05-02T10:05:00Z"
  }
}
```

---

### GET /dashboard/transfers

Histórico de Pix/TED recebido.

**Auth:** Requerido

**Query params:**
- `status` (pending, processing, completed, failed)
- `limit=20`
- `offset=0`

**Response (200):**
```json
{
  "transfers": [
    {
      "id": "trans_1",
      "splitId": "split_1",
      "projectName": "Podcast XYZ",
      "amount": "70.00",
      "method": "pix",
      "status": "completed",
      "completedAt": "2026-05-02T10:05:00Z"
    },
    {
      "id": "trans_2",
      "splitId": "split_2",
      "projectName": "Podcast XYZ",
      "amount": "20.00",
      "method": "pix",
      "status": "completed",
      "completedAt": "2026-05-02T10:05:00Z"
    }
  ],
  "total": 45,
  "summary": {
    "pendingAmount": "0.00",
    "processingAmount": "150.00",
    "completedAmount": "7850.00"
  }
}
```

---

## 🔔 WEBHOOKS

### POST /webhooks/stripe

Stripe chama isso quando pagamento sucede.

**Headers:**
```
stripe-signature: t=1234567890,v1=abcdef...
```

**Body:** Raw JSON do Stripe

**Processamento:**
1. Valida signature
2. Se `payment_intent.succeeded`:
   - Cria payment record
   - Enfileira job: calculateSplits
3. Return 200 OK

**Response (200):**
```json
{
  "received": true
}
```

**Errors:**
- 400: Signature inválida
- 500: Erro ao processar

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": {
    "email": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "JWT invalid or expired"
}
```

### 403 Forbidden
```json
{
  "error": "FORBIDDEN",
  "message": "You don't have permission"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Project not found"
}
```

### 500 Server Error
```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "requestId": "req_123abc"
}
```

---

## Rate Limiting

- 100 requests/min por IP
- 1000 requests/hora por usuário autenticado
- Header `X-RateLimit-Remaining` retorna disponíveis

---

## Próximo Passo

Abra **[05_WEBHOOK.md](05_WEBHOOK.md)** e entenda o webhook Stripe.
