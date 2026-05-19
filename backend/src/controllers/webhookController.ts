import { Request, Response } from 'express';
import { prisma, env } from '../config';
import { stripeService } from '../services/stripeService';
import { splitQueue } from '../jobs/queues';
import { logger } from '../utils/logger';

export const webhookController = {
  async stripe(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      res.status(400).json({ error: 'MISSING_SIGNATURE', message: 'stripe-signature header required' });
      return;
    }

    // Passo 1: Valida assinatura (usa raw body — NUNCA parsed JSON)
    let event: ReturnType<typeof stripeService.validateWebhookSignature>;
    try {
      event = stripeService.validateWebhookSignature(
        req.body as Buffer,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      logger.error({ err }, 'webhook: invalid signature');
      res.status(400).json({ error: 'INVALID_SIGNATURE', message: 'Webhook signature validation failed' });
      return;
    }

    logger.info({ eventId: event.id, type: event.type }, 'webhook: received');

    // Passo 2: Só processa payment_intent.succeeded (ignora o resto)
    if (event.type !== 'payment_intent.succeeded') {
      res.json({ received: true });
      return;
    }

    // Passo 3: Idempotência — não processa o mesmo evento duas vezes
    const existing = await prisma.stripeWebhook.findUnique({
      where: { eventId: event.id },
    });
    if (existing?.processed) {
      logger.info({ eventId: event.id }, 'webhook: already processed, skipping');
      res.json({ received: true });
      return;
    }

    // Passo 4: Extrai dados do PaymentIntent
    const pi = event.data.object as {
      id: string;
      amount: number;
      currency: string;
      metadata: Record<string, string>;
    };

    const projectId = pi.metadata['projectId'];
    if (!projectId) {
      logger.error({ eventId: event.id, piId: pi.id }, 'webhook: missing projectId in metadata');
      res.status(400).json({ error: 'MISSING_PROJECT_ID', message: 'PaymentIntent has no projectId in metadata' });
      return;
    }

    try {
      // Passo 5: Cria registro do pagamento
      const payment = await prisma.payment.create({
        data: {
          projectId,
          stripeId: pi.id,
          amount: pi.amount / 100, // centavos → reais
          currency: pi.currency.toUpperCase(),
          status: 'completed',
          metadata: {
            customerEmail: pi.metadata['customerEmail'] ?? null,
            customerName: pi.metadata['customerName'] ?? null,
          },
        },
      });

      // Passo 6: Registra o evento (idempotência)
      await prisma.stripeWebhook.create({
        data: {
          paymentId: payment.id,
          eventId: event.id,
          type: event.type,
          payload: event as object,
          processed: true,
        },
      });

      // Passo 7: Enfileira job assíncrono
      await splitQueue.add('calculateSplits', { paymentId: payment.id }, { priority: 1 });

      logger.info(
        { paymentId: payment.id, amount: payment.amount, projectId },
        'webhook: payment created, job enqueued',
      );
    } catch (err) {
      logger.error({ err, eventId: event.id }, 'webhook: processing error');
      // Retorna 500 para Stripe retentar com backoff exponencial
      res.status(500).json({ error: 'PROCESSING_ERROR', message: 'Failed to process webhook' });
      return;
    }

    res.json({ received: true });
  },
};
