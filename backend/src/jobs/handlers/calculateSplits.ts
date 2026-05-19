import Decimal from 'decimal.js';
import { splitQueue, transferQueue } from '../queues';
import { prisma } from '../../config';
import { logger } from '../../utils/logger';

splitQueue.process(async (job) => {
  const { paymentId } = job.data as { paymentId: string };

  logger.info({ paymentId }, 'calculateSplits: started');

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      project: { include: { collaborators: true } },
    },
  });

  if (!payment?.project) {
    throw new Error(`Payment ${paymentId} or its project not found`);
  }

  const { collaborators } = payment.project;

  if (collaborators.length === 0) {
    logger.warn({ paymentId }, 'calculateSplits: no collaborators found, skipping');
    return { skipped: true };
  }

  const totalPct = collaborators.reduce((s, c) => s + Number(c.percentage), 0);
  if (Math.round(totalPct) !== 100) {
    throw new Error(`calculateSplits: percentages sum to ${totalPct}%, expected 100`);
  }

  const splits = await Promise.all(
    collaborators.map((collab) => {
      const splitAmount = new Decimal(payment.amount.toString())
        .times(collab.percentage.toString())
        .dividedBy(100)
        .toDecimalPlaces(2);

      return prisma.split.create({
        data: {
          paymentId,
          collaboratorId: collab.id,
          amount: splitAmount.toNumber(),
          status: 'pending',
        },
      });
    }),
  );

  logger.info({ paymentId, count: splits.length }, 'calculateSplits: splits created');

  for (const split of splits) {
    await transferQueue.add(
      'sendTransfer',
      { splitId: split.id },
      { delay: 1000, priority: 1 },
    );
  }

  logger.info({ paymentId, count: splits.length }, 'calculateSplits: transfer jobs enqueued');

  return { splitsCreated: splits.length };
});

splitQueue
  .on('completed', (job) => logger.info({ jobId: job.id }, 'splitQueue: completed'))
  .on('failed', (job, err) =>
    logger.error({ jobId: job.id, err: err.message }, 'splitQueue: failed'),
  );
