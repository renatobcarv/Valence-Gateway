# 08 — Setup (Desenvolvimento Local)

## Pré-requisitos

### Software
- Node.js 22 LTS (https://nodejs.org)
- PostgreSQL 16 (local ou Docker)
- Redis (local ou Docker)
- Git

### Contas
- **Stripe:** https://stripe.com (test mode)
- **Pagar.me:** https://pagar.me (sandbox)
- **Supabase:** https://supabase.com (free tier)
- **Upstash:** https://upstash.com (Redis, free tier)

---

## Dia 1: Setup Local

### 1️⃣ Clonar e instalar

```bash
git clone https://github.com/seu-user/valence-backend.git
cd valence-backend

npm install
```

### 2️⃣ Criar .env.local

```bash
cp .env.example .env.local
```

Preencher:
```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/valence_dev"

# Supabase (local ou remoto)
SUPABASE_URL="http://localhost:54321"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

# Pagar.me
PAGARME_API_KEY="sk_test_..."

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="seu_secret_super_secreto"

# Node
NODE_ENV="development"
LOG_LEVEL="debug"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

### 3️⃣ Setup Supabase local

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# No diretório do projeto
supabase init

# Start
supabase start

# Output:
# API URL: http://localhost:54321
# Anon Key: eyJ...
# Service Role Key: eyJ...
# Database: postgresql://postgres:postgres@localhost:54322/postgres

# Atualizar .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
SUPABASE_URL="http://localhost:54321"
SUPABASE_SERVICE_ROLE_KEY="eyJ..." # Copiar de cima
```

### 4️⃣ Setup Redis

**Opção A: Docker**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Opção B: Homebrew (macOS)**
```bash
brew install redis
redis-server
```

**Verificar:**
```bash
redis-cli ping
# PONG
```

### 5️⃣ Prisma migrations

```bash
cd backend

npx prisma migrate dev --name init

# Cria prisma/migrations/.../_init/migration.sql
# Executa no seu banco local
# Gera @prisma/client
```

### 6️⃣ Seed data (opcional)

```bash
npx prisma db seed
```

Popula banco com dados de teste.

### 7️⃣ Rodar backend

```bash
npm run dev

# Output:
# Server running on http://localhost:3001
```

---

## Dia 2: Stripe Webhook Local

### Setup Stripe CLI

```bash
# Instalar
brew install stripe/stripe-cli/stripe

# Login
stripe login
# Gera código de autorização

# Listen localmente
stripe listen --forward-to localhost:3001/webhooks/stripe

# Output:
# > Ready! Your webhook signing secret is whsec_test_...

# Copiar pro .env.local
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### Testar webhook

Em outro terminal:
```bash
stripe trigger payment_intent.succeeded

# Seu backend vai receber e processar
# Veja logs: "Webhook received"
```

---

## Troubleshooting

### "Cannot connect to database"
```bash
# Verificar Postgres
psql -U postgres -d valence_dev

# Se Supabase, checkar status
supabase status

# Reset (CUIDADO: deleta dados)
supabase db reset
```

### "Redis connection refused"
```bash
# Verificar se Redis está rodando
redis-cli ping

# Se não, start
redis-server
```

### "Stripe webhook not triggering"
```bash
# Fazer login de novo
stripe login

# Listen novamente
stripe listen --forward-to localhost:3001/webhooks/stripe
```

### "Prisma migrations out of sync"
```bash
# Ver status
npx prisma migrate status

# Reset (só em dev!)
npx prisma migrate reset
```

---

## Development Scripts

```bash
# Dev (watch mode)
npm run dev

# Build
npm run build

# Start produção
npm run start

# Tests
npm run test
npm run test:watch

# Lint + Format
npm run lint
npm run format

# Type check
npm run type-check

# Prisma
npx prisma studio      # UI visual do banco
npx prisma migrate dev # Criar nova migration
npx prisma db seed     # Seed data
```

---

## Debugging

### VS Code

Criar `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach",
      "port": 9229
    }
  ]
}
```

Start com debug:
```bash
node --inspect-brk node_modules/.bin/tsx src/server.ts
```

VS Code → Run → Attach

### Logs

Backend usa Pino (logs estruturados):
```typescript
import { logger } from './utils/logger';

logger.info({ userId: '123' }, 'User created');
logger.error({ err }, 'Something failed');
logger.debug({ data }, 'Debug info');
```

---

## Database Inspection

### Prisma Studio

```bash
npx prisma studio

# Abre http://localhost:5555
# Interface visual pra navegar dados
```

### psql (línha de comando)

```bash
psql -U postgres -d valence_dev

# Ver tabelas
\dt

# Ver esquema de uma tabela
\d users

# Query SQL
SELECT * FROM users;
```

---

## Testing

### Unit Tests

```bash
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test --coverage
```

### Exemplo teste

```typescript
// src/__tests__/services.test.ts
import { projectService } from '../services';
import { prisma } from '../db';

describe('projectService', () => {
  it('should create a project', async () => {
    const project = await projectService.create({
      userId: 'user_123',
      name: 'Test Project'
    });

    expect(project.name).toBe('Test Project');
    expect(project.userId).toBe('user_123');
  });
});
```

---

## Environment Variables Checklist

### Backend (.env.local)

```
☐ DATABASE_URL (Postgres)
☐ SUPABASE_URL
☐ SUPABASE_SERVICE_ROLE_KEY
☐ STRIPE_SECRET_KEY (sk_test_...)
☐ STRIPE_WEBHOOK_SECRET (whsec_test_...)
☐ PAGARME_API_KEY
☐ JWT_SECRET (único, secreto)
☐ REDIS_URL (redis://localhost:6379)
☐ NODE_ENV=development
☐ LOG_LEVEL=debug
☐ FRONTEND_URL=http://localhost:3000
```

---

## Desenvolvimento por Dia

### Dia 1
- Setup completo
- Banco local rodando
- Prisma migrations OK

### Dia 2
- POST /auth/register
- POST /auth/login
- JWT middleware

### Dia 3
- POST /projects
- GET /projects
- GET /projects/:id

### Dia 4
- POST /projects/:id/collaborators
- Validações

### Dia 5
- POST /create-payment (Stripe)
- POST /webhooks/stripe (receber)
- Stripe signature validation

### Dia 6
- Bull queues (calculateSplits, sendTransfer)
- Pagar.me integration
- Dashboard endpoints

---

## Production Checklist (Railway)

Antes de fazer deploy:

- ✅ .env setado em Railway
- ✅ DATABASE_URL aponta pra Supabase remote
- ✅ REDIS_URL aponta pra Upstash
- ✅ STRIPE_SECRET_KEY é `sk_live_` (não `sk_test_`)
- ✅ STRIPE_WEBHOOK_SECRET é `whsec_live_`
- ✅ JWT_SECRET é único e forte
- ✅ FRONTEND_URL = https://valence.app
- ✅ Node version = 22
- ✅ npm run build → sem erros
- ✅ npm run migrate → migrations executadas

---

## Deploy (Railway)

```bash
# 1. Conectar repo ao Railway
# Acesse https://railway.app
# Novo projeto → GitHub repo

# 2. Railway auto-detecta Node.js
# Configura build: npm install && npm run build
# Configura start: npm start

# 3. Adicionar environment variables
# Via Railway UI: Settings → Variables

# 4. Auto-deploy em cada push
git push origin main
# Railway detecta, faz build, deploya

# 5. Verificar
curl https://api.valence.app/health
# {ok: true}
```

---

## Próximo: Comece pelo Dia 1

1. Faça todo o setup (2-3 horas)
2. Teste a conexão ao banco
3. Rode `npm run dev`
4. Vá pro [03_BANCO.md](03_BANCO.md) e comece a codar

---

**Boa sorte! Você tá pronto.**
