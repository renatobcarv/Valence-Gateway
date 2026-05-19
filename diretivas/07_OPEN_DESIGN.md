# 07 — Open Design Integration

**GitHub:** https://github.com/nexu-io/open-design

---

## O que é Open Design?

Framework de UI open-source com:
- Componentes prontos (botões, inputs, forms, modais)
- Temas responsivos
- TypeScript support
- React + Next.js compatibility

**Para Valence:** Open Design vai consumir sua API REST.

---

## URLs e Configuração

### Dev
```
Backend: http://localhost:3001/api
Frontend: http://localhost:3000
```

### Production
```
Backend: https://api.valence.app
Frontend: https://valence.app
```

### CORS (Backend)

Permitir requisições do frontend:

```typescript
// server.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**.env**
```
FRONTEND_URL=http://localhost:3000 (dev)
FRONTEND_URL=https://valence.app (prod)
```

---

## Fluxo: Open Design → Sua API

### 1️⃣ Login

**Open Design UI:**
```
Email: [input]
Password: [input]
[Login button]
```

**Fetch:**
```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { user, token } = await response.json();

// Armazenar token
localStorage.setItem('authToken', token);
```

**Seu backend retorna:**
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "eyJ..."
}
```

---

### 2️⃣ Criar Projeto

**Open Design UI:**
```
Project name: [input]
Description: [textarea]
[Create button]
```

**Fetch:**
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:3001/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Podcast XYZ',
    description: 'Podcast semanal'
  })
});

const { id, paymentLink } = await response.json();

// Copiar link pro clipboard
navigator.clipboard.writeText(paymentLink);
```

**Seu backend retorna:**
```json
{
  "id": "proj_abc",
  "name": "Podcast XYZ",
  "paymentLink": "https://pay.valence.app/proj_abc"
}
```

---

### 3️⃣ Adicionar Colaborador

**Open Design UI:**
```
Email: [input]
Name: [input]
Percentage: [input]
Bank Key: [input]
[Add button]
```

**Fetch:**
```javascript
const response = await fetch(
  `http://localhost:3001/api/projects/${projectId}/collaborators`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      email: 'maria@example.com',
      name: 'Maria',
      percentage: 20.00,
      bankInfo: {
        type: 'pix',
        key: 'maria@example.com'
      }
    })
  }
);
```

**Seu backend retorna:**
```json
{
  "id": "colab_2",
  "email": "maria@example.com",
  "name": "Maria",
  "percentage": 20.00
}
```

---

### 4️⃣ Gerar Link de Pagamento (Checkout)

**Open Design UI:**
```
[Stripe checkout embedded]
Valor: R$ 100,00
[Pagar button]
```

**Fetch (pra pegar client secret):**
```javascript
const response = await fetch(
  `http://localhost:3001/api/projects/${projectId}/create-payment`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 100.00,
      customerEmail: 'customer@example.com'
    })
  }
);

const { clientSecret, stripePublishableKey } = await response.json();

// Usar Stripe.js pra confirmar pagamento
stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});
```

**Seu backend retorna:**
```json
{
  "clientSecret": "pi_123_secret_456",
  "stripePublishableKey": "pk_live_...",
  "amount": 100.00
}
```

---

### 5️⃣ Dashboard de Ganhos

**Open Design UI:**
```
Total ganho: R$ 58.000,00
Pendente: R$ 500,00

[Histórico de transfers]
├─ João     R$ 70,00  ✓ Pix completado
├─ Maria    R$ 20,00  ✓ Pix completado
└─ Pedro    R$ 10,00  ⏳ Processando
```

**Fetch:**
```javascript
const response = await fetch(
  'http://localhost:3001/api/dashboard/earnings',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const earnings = await response.json();
// Display earnings.combined.totalEarnings
```

**Seu backend retorna:**
```json
{
  "asOwner": { "totalRevenue": "...", "totalProjects": 2 },
  "asCollaborator": { "totalEarned": "...", "collaboratingIn": 3 },
  "combined": { "totalEarnings": "58000.00" }
}
```

---

### 6️⃣ Histórico de Transfers

**Open Design UI:**
```
[Lista de transfers]
├─ 02/05 João Pix     R$ 70,00  ✓
├─ 02/05 Maria Pix    R$ 20,00  ✓
└─ 02/05 Pedro Pix    R$ 10,00  ✓
```

**Fetch:**
```javascript
const response = await fetch(
  'http://localhost:3001/api/dashboard/transfers?status=completed&limit=20',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const { transfers, total } = await response.json();
// Map sobre transfers, renderizar lista
```

**Seu backend retorna:**
```json
{
  "transfers": [
    {
      "id": "trans_1",
      "amount": "70.00",
      "method": "pix",
      "status": "completed",
      "projectName": "Podcast XYZ",
      "completedAt": "2026-05-02T10:05:00Z"
    }
  ],
  "total": 45
}
```

---

## Realtime Updates (Supabase)

Quando transfer é criado no seu backend, dashboard atualiza em tempo real:

**Backend (dentro do job):**
```typescript
// Quando transfer é criado, Supabase broadcast automaticamente
await prisma.transfer.create({ ... });
// Supabase vê o INSERT e publica evento
```

**Open Design (frontend):**
```javascript
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

export function TransfersComponent() {
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    // Subscribe a mudanças na tabela
    const subscription = supabase
      .from('transfers')
      .on('INSERT', (payload) => {
        // Novo transfer criado
        setTransfers((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      {transfers.map((t) => (
        <div key={t.id}>{t.amount} - {t.status}</div>
      ))}
    </div>
  );
}
```

---

## Error Handling (Open Design)

Quando sua API retorna erro:

```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  ...
});

if (!response.ok) {
  const error = await response.json();
  // error.error: "VALIDATION_ERROR"
  // error.message: "Invalid input"
  // error.details: {email: "..."}
  
  // Mostrar pra user
  alert(`Erro: ${error.message}`);
}
```

---

## Headers e Authentication

**Toda request autenticada:**
```
Authorization: Bearer {token_do_login}
```

**Stripe headers (automático do Stripe.js):**
```
Sem bearer, Stripe lida direto
```

---

## Environment Variables (Open Design)

```
REACT_APP_API_URL=http://localhost:3001/api (dev)
REACT_APP_API_URL=https://api.valence.app (prod)

REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_... (dev)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_... (prod)

REACT_APP_SUPABASE_URL=http://localhost:54321 (dev)
REACT_APP_SUPABASE_URL=https://xxx.supabase.co (prod)

REACT_APP_SUPABASE_ANON_KEY=eyJ... (dev)
REACT_APP_SUPABASE_ANON_KEY=eyJ... (prod)
```

---

## API Contract (Checklist)

Seu backend precisa retornar exatamente isto:

### Auth
- ✅ POST /auth/register → {user, token}
- ✅ POST /auth/login → {user, token}

### Projects
- ✅ POST /projects → {id, name, paymentLink, createdAt}
- ✅ GET /projects → {projects: [], total, limit, offset}
- ✅ GET /projects/:id → {id, name, description, collaborators: [], stats: {}}

### Collaborators
- ✅ POST /projects/:id/collaborators → {id, email, name, percentage}
- ✅ GET /projects/:id/collaborators → {collaborators: [], totalPercentage}

### Payments
- ✅ POST /projects/:id/create-payment → {clientSecret, stripePublishableKey, amount}

### Dashboard
- ✅ GET /dashboard/earnings → {asOwner, asCollaborator, combined}
- ✅ GET /dashboard/transfers → {transfers: [], total, summary}

### Webhooks
- ✅ POST /webhooks/stripe → {received: true}

---

## Deployment Checklist

**Backend (Railway):**
- ✅ DATABASE_URL setado
- ✅ STRIPE_SECRET_KEY setado
- ✅ PAGARME_API_KEY setado
- ✅ REDIS_URL setado
- ✅ FRONTEND_URL = https://valence.app
- ✅ STRIPE_WEBHOOK_SECRET setado

**Frontend (Open Design):**
- ✅ REACT_APP_API_URL = https://api.valence.app
- ✅ REACT_APP_STRIPE_PUBLISHABLE_KEY = pk_live_...
- ✅ CORS permitido no backend

---

## Próximo Passo

Abra **[08_SETUP.md](08_SETUP.md)** e inicie seu desenvolvimento local.
