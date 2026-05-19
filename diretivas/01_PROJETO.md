# 01 — Projeto

## O que é Valence?

Valence é uma **plataforma de split de pagamentos** que permite que criadores, produtores e consultores **dividam receita automaticamente**.

**Cenário típico:**
- YouTuber cria vídeo (ganha 70% da receita)
- Editor trabalha no vídeo (ganha 20%)
- Produtor gravou (ganha 10%)
- Alguém paga R$100 de donativo
- Sistema divide automaticamente e dispara Pix pra cada um

---

## Por que backend only?

**Você constrói:** API REST robusta, banco de dados, webhook, jobs assíncrono, integrações (Stripe, Pagar.me).

**Open Design constrói:** UI, componentes, formulários, layout, roteamento.

**Divisão clara:**
- Você = lógica de negócio (pagamento, split, transfer)
- Open Design = interface (login, formulários, dashboard)

**Vantagem:**
- Você se aprofunda em backend (recrutador vê especialização)
- Open Design tá pronto (não precisa gastar tempo fazendo UI)
- API fica reutilizável (pode usar em mobile depois)

---

## Objetivo (MVP 6 dias)

```
User registration
     ↓
Create project + add collaborators
     ↓
Share payment link
     ↓
Customer pays (Stripe)
     ↓
Split automático (70%, 20%, 10%)
     ↓
Pix disparado pra cada um
     ↓
Dashboard mostra ganhos
```

**Tudo isso em 6 dias.** Rodando. Em produção.

---

## Escopo

### ✅ Incluído (MVP)
- Autenticação (Supabase Auth)
- CRUD de projetos e colaboradores
- Payment intent Stripe
- Webhook Stripe
- Split calculation (automático)
- Transfer Pix/TED (Pagar.me)
- Dashboard de ganhos
- Email de confirmação
- Supabase Realtime (atualizações em tempo real)

### ❌ Fora de escopo (v2.0+)
- Webhooks de clientes externos
- Relatórios avançados
- Analytics IA
- Automação de cobranças recorrentes
- Múltiplas moedas
- App mobile

---

## Stack Backend (2026)

```
┌─────────────────────────────────┐
│  Node.js 22 LTS                 │
├─────────────────────────────────┤
│  Express.js (web framework)     │
├─────────────────────────────────┤
│  TypeScript (type safety)       │
├─────────────────────────────────┤
│  Zod (validation)               │
├─────────────────────────────────┤
│  Prisma (ORM)                   │
├─────────────────────────────────┤
│  PostgreSQL 16 (Supabase)       │
│  Redis (Upstash)                │
├─────────────────────────────────┤
│  Bull (job queue)               │
│  Stripe SDK                     │
│  Pagar.me SDK                   │
├─────────────────────────────────┤
│  Pino (logging)                 │
│  Jest (testing)                 │
├─────────────────────────────────┤
│  Railway (deploy)               │
└─────────────────────────────────┘
```

---

## Requisitos Técnicos

### Obrigatório
- Node.js 22 LTS instalado
- PostgreSQL 16 (via Supabase)
- Redis (via Upstash)
- Contas: Stripe, Pagar.me, Supabase

### Recomendado
- VS Code
- Postman ou Insomnia (testar API)
- Git (versionamento)

---

## Decisões Inegociáveis

Uma vez tomadas, não mudam sem discussão:

| Decisão | Valor | Por quê |
|---------|-------|--------|
| TypeScript strict | ✅ | Zero `any`, segurança |
| Prisma como ORM | ✅ | Type-safe, migrations automáticas |
| Zod validation | ✅ | Elegante, type-safe |
| Bull + Redis | ✅ | Jobs confiável, essencial pra Pix |
| Supabase | ✅ | Postgres + Auth + RLS + Realtime |
| Stripe API | ✅ | Industry standard, documentado |
| Pagar.me | ✅ | Pix rápido, tailored pra Brasil |
| Railway deploy | ✅ | Simples, scaling automático |
| Pino logging | ✅ | Estruturado, performance |

---

## Métricas de Sucesso

**Dia 6:**
- [ ] API respondendo (200 OK)
- [ ] 9 endpoints funcionando
- [ ] Webhook Stripe processando
- [ ] Transfer Pix completo
- [ ] Testes passando (>80% coverage)
- [ ] Rodando em produção (Railway)

**Recruiter:**
- [ ] Entende em 30s o que você fez
- [ ] Pergunta "como funciona o webhook?"
- [ ] Você explica com confiança

---

## Timeline (Honesta)

```
Dia 1  Setup + DB          → 4h
       (npm, Prisma, migrations)

Dia 2  Auth + Projects      → 5h
       (login, CRUD, JWT)

Dia 3  Stripe integration   → 5h
       (payment intent, webhook prep)

Dia 4  Webhook processing   → 5h
       (receber webhook, calcular split, enfileirar jobs)

Dia 5  Jobs + Transfers     → 5h
       (Bull, sendTransfer, Pagar.me API)

Dia 6  Dashboard + Deploy   → 5h
       (endpoints finais, Railway, polish)

Total: ~34h (trabalho focado)
```

**Não é 30 horas.** É 34 horas. Ser honesto é importante.

---

## Open Design (Frontend)

Você **não** faz UI. Open Design é um framework open-source pronto.

```
GitHub: https://github.com/nexu-io/open-design
```

**O que você precisa saber:**
- Open Design faz fetch pra sua API em `http://localhost:3001`
- Você precisa retornar JSON válido nos endpoints
- CORS precisa permitir requisições do Open Design
- Supabase Realtime vai atualizar UI em tempo real

**Você só faz:**
```
→ POST /auth/register {email, password, name}
→ POST /auth/login {email, password}
→ POST /projects {name, description}
→ GET /projects
→ POST /projects/:id/collaborators {email, percentage, bankInfo}
→ POST /projects/:id/create-payment {amount}
→ GET /dashboard/earnings
→ GET /dashboard/transfers
→ POST /webhooks/stripe {payload}
```

Open Design consome isso e renderiza a UI.

---

## Prioridades

### 1️⃣ Funcional (não quebra produção)
- API respondendo
- Webhook Stripe processando
- Transfers disparando

### 2️⃣ Correto (lógica certa)
- Split calculation exato
- Idempotência em webhooks
- Retry automático em falhas

### 3️⃣ Seguro (proteção de dados)
- JWT validation
- Webhook signature validation
- RLS no banco (isolamento por user)

### 4️⃣ Rápido (performance)
- Índices no banco
- Cache com Redis
- Logs estruturados (não debug)

### 5️⃣ Bonito (código limpo)
- TypeScript strict
- Prettier + ESLint
- Testes passando
- README

---

## Estrutura de Documentos

```
01_PROJETO.md         ← Você está aqui
02_ARQUITETURA.md     → Stack, estrutura, fluxo
03_BANCO.md           → Schema Prisma
04_ENDPOINTS.md       → API REST
05_WEBHOOK.md         → Webhook Stripe
06_JOBS.md            → Bull + async processing
07_OPEN_DESIGN.md     → Integração com frontend
08_SETUP.md           → Setup local + deploy
```

Leia nesta ordem.

---

## Próximo Passo

Abra **[02_ARQUITETURA.md](02_ARQUITETURA.md)** e entenda como tudo se conecta.

Você está pronto.
