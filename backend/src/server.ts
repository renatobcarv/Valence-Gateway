import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { env } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware';
import apiRoutes from './routes';
import webhookRoutes from './routes/webhooks';

// Inicializa job processors (registra handlers no Bull)
import { splitQueue, transferQueue, notificationQueue } from './jobs';

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'RATE_LIMIT', message: 'Too many requests, please try again later' },
  }),
);

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ─── Webhook (ANTES do express.json — precisa de raw body) ───────────────────
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Bull Board (monitoramento de filas — apenas em dev) ─────────────────────
if (env.NODE_ENV !== 'production') {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: [
      new BullAdapter(splitQueue),
      new BullAdapter(transferQueue),
      new BullAdapter(notificationQueue),
    ],
    serverAdapter,
  });
  app.use('/admin/queues', serverAdapter.getRouter());
  logger.info('Bull Board available at http://localhost:3001/admin/queues');
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: env.NODE_ENV, ts: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Error Handler (último middleware) ────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  const port = env.PORT;
  app.listen(port, () => {
    logger.info({ port, env: env.NODE_ENV }, `Valence API running on http://localhost:${port}`);
  });
}

export default app;
