import { transferQueue, notificationQueue } from '../queues';
import { prisma } from '../../config';
import { stripeService } from '../../services/stripeService';
import { logger } from '../../utils/logger';

// 8 workers paralelos para processar transfers simultâneos
transferQueue.process(8, async (job) => {
  const { splitId } = job.data as { splitId: string };

  logger.info({ splitId, attempt: job.attemptsMade }, 'sendTransfer: started');

  const split = await prisma.split.findUnique({
    where: { id: splitId },
    include: {
      collaborator: true,
      payment: { include: { project: true } },
    },
  });

  if (!split) throw new Error(`Split ${splitId} not found`);

  const { collaborator, payment } = split;

  if (!collaborator.stripeAccountId) {
    // Sem conta Stripe Connect — registra como falha explicativa, não retenta
    await prisma.transfer.create({
      data: {
        splitId,
        collaboratorId: collaborator.id,
        method: 'stripe_transfer',
        amount: split.amount,
        status: 'failed',
        errorMessage: `Collaborator ${collaborator.email} has no Stripe account connected`,
        retryCount: job.attemptsMade,
      },
    });

    await prisma.split.update({ where: { id: splitId }, data: { status: 'failed' } });

    logger.warn(
      { splitId, email: collaborator.email },
      'sendTransfer: collaborator missing stripeAccountId',
    );
    return { skipped: true, reason: 'no_stripe_account' };
  }

  const stripeTransfer = await stripeService.createTransfer({
    amount: Number(split.amount),
    currency: payment.currency,
    destination: collaborator.stripeAccountId,
    transferGroup: payment.id,
    splitId,
    projectId: payment.projectId,
  });

  const transfer = await prisma.transfer.create({
    data: {
      splitId,
      collaboratorId: collaborator.id,
      method: 'stripe_transfer',
      amount: split.amount,
      status: 'completed',
      stripeTransferId: stripeTransfer.id,
      externalStatus: String(stripeTransfer.amount),
      completedAt: new Date(),
      retryCount: job.attemptsMade,
    },
  });

  await prisma.split.update({ where: { id: splitId }, data: { status: 'transferred' } });

  logger.info(
    { splitId, transferId: transfer.id, stripeTransferId: stripeTransfer.id },
    'sendTransfer: completed',
  );

  await notificationQueue.add('sendEmail', {
    email: collaborator.email,
    type: 'transfer_completed',
    metadata: {
      amount: Number(split.amount).toFixed(2),
      projectName: payment.project.name,
      stripeTransferId: stripeTransfer.id,
    },
  });

  return { transferId: transfer.id };
});

transferQueue
  .on('completed', (job) => logger.info({ jobId: job.id }, 'transferQueue: completed'))
  .on('failed', (job, err) =>
    logger.error({ jobId: job.id, err: err.message }, 'transferQueue: failed'),
  );
