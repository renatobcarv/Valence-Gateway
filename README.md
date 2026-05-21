<div align="center">

# Valence Gateway

**Divisão automática de receita para criadores, produtores e consultores.**

[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Stripe](https://img.shields.io/badge/Stripe-Integrado-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Como funciona](#como-funciona) • [Stack](#stack) • [Começando](#começando) • [API](#api) • [Deploy](#deploy) • [Por que foi criado](#por-que-foi-criado)

</div>

---

## O que é

**Valence Gateway** é uma plataforma de **split de pagamentos** — quando alguém paga um projeto, o dinheiro é automaticamente dividido e transferido para cada colaborador via Pix, sem intervenção manual.

### O problema

Criadores que trabalham com equipes — editores, roteiristas, produtores, parceiros de consultoria — recebem o valor total e precisam manualmente calcular e transferir a parte de cada um. Isso gera atrito, atraso, e espaço para erros.

### A solução

Um criador cadastra um projeto, define os percentuais de cada colaborador, compartilha um link de pagamento. Quando o cliente paga, o sistema:

1. Recebe a confirmação do Stripe via webhook
2. Calcula automaticamente o valor de cada colaborador
3. Dispara transferências Pix via Pagar.me para cada um
4. Notifica todos por e-mail
5. Exibe tudo no dashboard em tempo real

**Exemplo:**

| Colaborador | Papel     | Percentual | Recebe (em R$ 1.000) |
|-------------|-----------|:----------:|:--------------------:|
| Ana         | Criadora  | 70%        | R$ 700,00            |
| Bruno       | Editor    | 20%        | R$ 200,00            |
| Carla       | Produtora | 10%        | R$ 100,00            |

---

## Como funciona

```
Cliente faz pagamento (Stripe)
        │
        ▼
Webhook /webhooks/stripe
        │  valida assinatura
        ▼
Payment salvo no banco
        │
        ▼
[Job] calculateSplits ──► Split por colaborador calculado
        │
        ▼
[Job] sendTransfer ──────► Pix via Pagar.me para cada um
        │
        ▼
[Job] sendEmail ─────────► Notificação enviada
        │
        ▼
Dashboard atualiza via Supabase Realtime (WebSocket)
```

O processamento assíncrono (via **Bull + Redis**) garante que falhas em transferências individuais sejam retentadas sem bloquear o fluxo principal.

---

## Stack

### Backend

| Tecnologia | Uso |
|------------|-----|
| **Express 5** | Framework HTTP |
| **TypeScript 5 (strict)** | Tipo-segurança zero `any` |
| **Prisma 5** | ORM + migrations |
| **PostgreSQL 16** | Banco de dados (via Supabase) |
| **Bull + Redis** | Fila de jobs assíncrona |
| **Stripe SDK** | Recebimento de pagamentos |
| **Pagar.me API** | Transferências Pix/TED |
| **Zod 4** | Validação de inputs |
| **JWT + bcryptjs** | Autenticação |
| **Pino** | Logs estruturados JSON |
| **Helmet + rate-limit** | Segurança HTTP |

### Frontend

| Tecnologia | Uso |
|------------|-----|
| **Next.js 15** | Framework React |
| **React 19** | UI |
| **TanStack Query** | Cache e sincronização de dados |
| **React Hook Form** | Formulários com validação |
| **Tailwind CSS 4** | Estilização |
| **Stripe Elements** | UI de pagamento segura |
| **Recharts** | Gráficos do dashboard |
| **Motion** | Animações |
| **Axios** | Cliente HTTP com interceptors |

### Infraestrutura

| Serviço | Função |
|---------|--------|
| **Railway** | Hospedagem do backend |
| **Vercel** | Hospedagem do frontend |
| **Supabase** | PostgreSQL + Realtime + RLS |
| **Upstash** | Redis gerenciado (jobs) |

---

## Começando

### Pré-requisitos

- Node.js 22 LTS
- PostgreSQL 16 (local ou Supabase)
- Redis (local ou Upstash)
- Contas: Stripe, Pagar.me, Supabase

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/ValenceGateway.git
cd ValenceGateway
```

### 2. Configure o backend

```bash
cd backend
cp .env.example .env.local
```

Preencha `.env.local` com suas credenciais (veja [Variáveis de Ambiente](#variáveis-de-ambiente)).

```bash
npm install
npx prisma migrate dev      # Cria tabelas no banco
npm run prisma:seed         # Popula dados de teste (opcional)
npm run dev                 # http://localhost:3001
```

### 3. Configure o frontend

```bash
cd ../app
npm install
# Crie .env.local com NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                 # http://localhost:3000
```

### 4. Webhooks do Stripe (desenvolvimento local)

```bash
stripe listen --forward-to localhost:3001/webhooks/stripe
# Copie o whsec_ gerado para .env.local como STRIPE_WEBHOOK_SECRET

stripe trigger payment_intent.succeeded  # Testa o fluxo completo
```

---

## Variáveis de Ambiente

```env
# Servidor
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Banco de dados
DATABASE_URL=postgresql://user:pass@host/db

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pagar.me (Pix)
PAGARME_API_KEY=sk_test_...

# Redis (Bull jobs)
REDIS_URL=redis://localhost:6379

# Autenticação
JWT_SECRET=minimo-32-caracteres-aqui
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## API

### Autenticação

```
POST /api/auth/register    Cria conta
POST /api/auth/login       Login → retorna JWT
```

### Projetos

```
POST   /api/projects                    Cria projeto
GET    /api/projects                    Lista projetos do usuário
GET    /api/projects/:id                Detalhe + colaboradores + stats
PUT    /api/projects/:id                Atualiza
DELETE /api/projects/:id                Remove (soft delete)
```

### Colaboradores

```
POST   /api/projects/:id/collaborators          Adiciona colaborador
GET    /api/projects/:id/collaborators          Lista
PUT    /api/projects/:id/collaborators/:colId   Atualiza % ou chave Pix
DELETE /api/projects/:id/collaborators/:colId   Remove
```

### Pagamentos

```
POST /api/projects/:id/create-payment   Cria Payment Intent no Stripe
GET  /api/payments                      Histórico com detalhes de splits
```

### Dashboard

```
GET /api/dashboard/earnings     Ganhos totais (dono + colaborador)
GET /api/dashboard/transfers    Histórico de transferências com status
```

### Webhook

```
POST /api/webhooks/stripe       Confirmação de pagamento (valida assinatura)
```

### Outros

```
GET /health                     Health check
GET /admin/queues               Bull Board (dev only)
```

> Todas as rotas protegidas exigem `Authorization: Bearer <token>`.

---

## Banco de Dados

8 modelos principais gerenciados pelo Prisma:

```
User ──────► Project ──────► Collaborator
                │                  │
                ▼                  ▼
             Payment ──────► Split ──────► Transfer
                │
                ▼
         StripeWebhook (auditoria + dedup)
```

**Destaques do schema:**
- `Split.percentage` — `Decimal(5,2)` para precisão financeira
- `StripeWebhook.eventId` — índice único para deduplicação de webhooks
- `Transfer.retryCount` + `lastRetryAt` — controle de retentativas
- RLS (Row-Level Security) habilitado no Supabase

---

## Scripts

### Backend

```bash
npm run dev           # Modo watch (tsx)
npm run build         # Compila TypeScript
npm run start         # Inicia produção
npm run test          # Jest
npm run type-check    # Verificação de tipos
npm run lint          # ESLint
npm run format        # Prettier
npx prisma studio     # GUI do banco (localhost:5555)
```

### Frontend

```bash
npm run dev           # Next.js dev server
npm run build         # Build de produção
npm run lint          # ESLint
```

---

## Deploy

### Backend → Railway

1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente no dashboard
3. Railway detecta automaticamente Node.js e executa:
   ```bash
   npm install && npm run build && npm start
   ```
4. Deploy automático a cada push para `main`

### Frontend → Vercel

1. Conecte a pasta `app/` ao Vercel
2. Defina `NEXT_PUBLIC_API_URL` com a URL do backend no Railway
3. Deploy automático a cada push

### Checklist de produção

- [ ] Chaves Stripe `sk_live_` e `whsec_live_` (não teste)
- [ ] `DATABASE_URL` aponta para Supabase produção
- [ ] `REDIS_URL` aponta para Upstash produção
- [ ] `JWT_SECRET` forte e único
- [ ] `FRONTEND_URL` com domínio de produção
- [ ] `npm run build` passa sem erros
- [ ] Migrations executadas: `npx prisma migrate deploy`

---

## Segurança

- **JWT** com expiração configurável (padrão 24h)
- **Validação de assinatura** em todos os webhooks Stripe
- **RLS no Supabase** — usuários só acessam seus próprios dados
- **Rate limiting** — 100 req/min por IP
- **CORS** restrito à origem do frontend
- **Helmet** — headers de segurança HTTP
- **Bcryptjs** — hash de senhas

---

## Por que foi criado

Projetos colaborativos — cursos, canais do YouTube, consultorias compartilhadas, agências — têm um gargalo operacional invisível: **a divisão manual de receita**. Quem recebe o pagamento vira tesoureiro involuntário, calculando e transferindo manualmente para cada pessoa do time.

Isso não é um problema de nicho. É o dia a dia de qualquer criador que trabalha com equipe.

**Valence Gateway** resolve isso com infraestrutura de pagamento real (Stripe + Pagar.me), sem exigir que os colaboradores tenham conta na mesma plataforma — basta ter uma chave Pix.

O projeto foi construído como MVP em 6 dias com foco em:
- **Confiabilidade** — jobs com retry, webhooks com deduplicação
- **Tipo-segurança** — TypeScript strict, Zod, Prisma end-to-end
- **Praticidade** — deploy simples via Railway + Vercel, zero DevOps complexo

---

## Estrutura do repositório

```
ValenceGateway/
├── backend/          # API Express + Prisma + Bull
│   ├── src/
│   │   ├── routes/   # Endpoints REST
│   │   ├── services/ # Lógica de negócio
│   │   ├── jobs/     # Workers assíncronos
│   │   └── prisma/   # Schema + migrations
│   └── tests/
├── app/              # Frontend Next.js
│   └── src/
│       ├── app/      # Pages (auth + dashboard)
│       └── components/
├── diretivas/        # Documentação técnica detalhada
│   ├── 01_PROJETO.md
│   ├── 02_ARQUITETURA.md
│   ├── 03_BANCO.md
│   ├── 04_ENDPOINTS.md
│   ├── 05_WEBHOOK.md
│   ├── 06_JOBS.md
│   └── 08_SETUP.md
└── prototipe/        # Mockups estáticos da UI
```

---

## Licença

MIT — veja [LICENSE](LICENSE) para detalhes.

---

<div align="center">

Feito por [Renato Carvalho](mailto:renato.bcarvalho7@gmail.com)

</div>
