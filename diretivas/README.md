# Valence — Backend Specification

**Tipo:** Backend Only (API REST)  
**Stack:** Node.js 22 + Express + TypeScript + Prisma + Stripe + Pagar.me  
**Frontend:** Open Design (externo — você consome via API)  
**Deploy:** Railway + Supabase + Redis (Upstash)  
**Timeline:** 6 dias  

---

## 📚 Documentação (Leia nesta ordem)

| # | Doc | Tempo | Foco |
|---|-----|-------|------|
| 1 | **[01_PROJETO.md](01_PROJETO.md)** | 10 min | Visão geral, objetivo, escopo |
| 2 | **[02_ARQUITETURA.md](02_ARQUITETURA.md)** | 15 min | Stack, estrutura de pastas, fluxo |
| 3 | **[03_BANCO.md](03_BANCO.md)** | 20 min | Schema Prisma, tabelas, RLS |
| 4 | **[04_ENDPOINTS.md](04_ENDPOINTS.md)** | 30 min | API REST completa (9 endpoints) |
| 5 | **[05_WEBHOOK.md](05_WEBHOOK.md)** | 15 min | Stripe webhook, processamento |
| 6 | **[06_JOBS.md](06_JOBS.md)** | 20 min | Bull + Redis, async processing |
| 7 | **[07_OPEN_DESIGN.md](07_OPEN_DESIGN.md)** | 10 min | Como Open Design chama sua API |
| 8 | **[08_SETUP.md](08_SETUP.md)** | 40 min | Instalação e desenvolvimento local |

**Total:** ~2h 40min → Você tá pronto pra codar

---

## ⚡ Se tá com pressa (TL;DR)

1. Leia [01_PROJETO.md](01_PROJETO.md) — 10 min
2. Veja diagrama em [02_ARQUITETURA.md](02_ARQUITETURA.md) — 5 min
3. Veja o fluxo em [05_WEBHOOK.md](05_WEBHOOK.md) — 10 min
4. Veja setup em [08_SETUP.md](08_SETUP.md) — 10 min

**35 min** = você entende o essencial e já pode começar.

---

## 🎯 O que você vai construir

**Uma API REST que:**

```
POST   /auth/register         → Usuário cria conta
POST   /auth/login            → Faz login, gera JWT
POST   /projects              → Cria projeto de split
GET    /projects              → Lista seus projetos
POST   /projects/:id/collaborators    → Adiciona pessoa na divisão
POST   /projects/:id/create-payment   → Gera link de pagamento Stripe
GET    /dashboard/earnings            → Mostra quanto você ganhou
GET    /dashboard/transfers           → Histórico de Pix recebido
POST   /webhooks/stripe               → Processa pagamento (Stripe chama)
```

**Quando alguém paga R$100:**
1. Stripe cobra
2. Webhook chega no seu backend
3. Backend calcula divisão (70%, 20%, 10%)
4. Dispara Pix automático pra cada pessoa
5. Dashboard atualiza em tempo real

**Sem UI.** Open Design faz a UI. Você faz a lógica + banco + pagamento.

---

## 🛠️ Stack (2026)

| Camada | Tech | Por quê |
|--------|------|--------|
| **Runtime** | Node.js 22 | Rápido, LTS, estável |
| **Web Framework** | Express | Simples, robusto, bem documentado |
| **Linguagem** | TypeScript | Type-safe, zero surpresas em produção |
| **Validação** | Zod | Elegante, type-safe |
| **Banco** | PostgreSQL 16 | Supabase (gerenciado) |
| **ORM** | Prisma | Type-safe, migrations automáticas |
| **Auth** | Supabase Auth | OAuth built-in, JWT |
| **Cache/Queue** | Redis + Bull | Jobs confiável |
| **Pagamentos** | Stripe API | Industry standard |
| **Transfers** | Pagar.me API | Pix rápido no Brasil |
| **Logs** | Pino | Estruturado, fast |
| **Deploy** | Railway | Simples, scaling automático |

---

## 📊 Estrutura do Backend

```
backend/
├── src/
│   ├── server.ts                    # Entry point
│   ├── config/
│   │   ├── env.ts                   # Variáveis de ambiente (Zod)
│   │   ├── stripe.ts
│   │   └── pagarme.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── payments.ts
│   │   ├── dashboard.ts
│   │   └── webhooks.ts              # POST /webhooks/stripe
│   ├── controllers/
│   ├── services/                    # Lógica de negócio
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   ├── stripeService.ts
│   │   ├── splitService.ts          # Cálculo de divisão
│   │   ├── transferService.ts       # Pix via Pagar.me
│   │   └── emailService.ts
│   ├── middleware/
│   │   ├── auth.ts                  # JWT
│   │   ├── errorHandler.ts
│   │   └── validation.ts            # Zod
│   ├── jobs/                        # Bull queues
│   │   ├── splitQueue.ts
│   │   ├── transferQueue.ts
│   │   └── notificationQueue.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── types/
│
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔄 Fluxo Completo (Simplificado)

```
User clica "Pagar R$100"
         │
         ▼
Frontend (Open Design) faz:
POST /projects/:id/create-payment
         │
         ▼
Backend cria payment intent Stripe
(retorna client secret)
         │
         ▼
Open Design renderiza Stripe checkout
         │
         ▼
User preenche cartão e confirma
         │
         ▼
Stripe cobra e envia webhook
         │
         ▼
Backend recebe em:
POST /webhooks/stripe
         │
         ▼
Backend cria payment record
Enfileira job: calculateSplits
         │
         ▼
Job calcula: 70%, 20%, 10%
Enfileira job: sendTransfer
         │
         ▼
Job dispara Pix/TED via Pagar.me
         │
         ▼
Dashboard atualiza em tempo real
(Supabase Realtime)
```

---

## 📈 Timeline (6 dias)

```
Dia 1  Setup + Database
       ├─ npm init, TypeScript, Prettier, ESLint
       ├─ Prisma setup
       ├─ Schema migrations
       └─ Seed data

Dia 2  Auth + Projects CRUD
       ├─ POST /auth/register
       ├─ POST /auth/login
       ├─ POST /projects
       ├─ GET /projects
       └─ JWT middleware

Dia 3  Stripe integration
       ├─ POST /create-payment
       ├─ stripeService.ts
       ├─ Webhook setup
       └─ Signature validation

Dia 4  Async processing
       ├─ Bull + Redis setup
       ├─ Job: calculateSplits
       ├─ Job: sendTransfer
       └─ Job: sendEmail

Dia 5  Dashboard + Realtime
       ├─ GET /dashboard/earnings
       ├─ GET /dashboard/transfers
       ├─ Supabase Realtime subscribe
       └─ Tests

Dia 6  Deploy + Polish
       ├─ Railway setup
       ├─ Env vars
       ├─ Health check
       └─ Swagger docs
```

---

## ✅ Ao final você tem:

- ✅ API REST funcional (9 endpoints)
- ✅ Autenticação JWT
- ✅ Banco PostgreSQL (8 tabelas)
- ✅ Validação com Zod
- ✅ Webhook Stripe processando
- ✅ Jobs assíncrono (Bull + Redis)
- ✅ Transfers Pix via Pagar.me
- ✅ Dashboard com Realtime
- ✅ Testes passando
- ✅ Rodando em produção (Railway)

**Pronto pro portfólio:**
> "Fiz um backend de split de pagamento com Stripe + Pix automático. Rodando em produção."

---

## 🎬 Como começar

1. **Leia os 8 documentos** (2h 40min, em ordem)
2. **Abra [08_SETUP.md](08_SETUP.md)** e siga o setup local
3. **Comece pelo Dia 1** ([03_BANCO.md](03_BANCO.md))
4. **Cada dia = 1 documento**
5. **Dia 6 = rodando em produção**

---

## 📞 Dúvidas?

Se encontrar algo vago ou contraditório:
- Anote qual documento
- Qual seção
- O que tá confuso
- Me avisa

Especificação ruim é culpa minha, não sua.

---

## 🔗 Links Úteis

- **Open Design:** https://github.com/nexu-io/open-design
- **Stripe Docs:** https://stripe.com/docs/api
- **Pagar.me Docs:** https://dev.pagar.me
- **Supabase:** https://supabase.com
- **Prisma:** https://www.prisma.io
- **Bull:** https://github.com/OptimalBits/bull

---

**Próximo:** Abra [01_PROJETO.md](01_PROJETO.md)

Bora focar só em backend. Sem distração.
