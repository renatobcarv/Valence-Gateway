import { notificationQueue } from '../queues';
import { logger } from '../../utils/logger';

notificationQueue.process(async (job) => {
  const { email, type, metadata } = job.data as {
    email: string;
    type: string;
    metadata: Record<string, string>;
  };

  logger.info({ email, type }, 'sendEmail: started');

  // TODO Dia 6: integrar SendGrid / Resend
  // Por enquanto loga — email service será adicionado no polish final
  logger.info(
    {
      to: email,
      type,
      subject:
        type === 'transfer_completed'
          ? `Você recebeu R$ ${metadata['amount']} do projeto ${metadata['projectName']}`
          : 'Notificação Valence',
    },
    'sendEmail: [mock] email would be sent here',
  );

  return { sent: false, reason: 'email_service_not_configured' };
});

notificationQueue
  .on('completed', (job) => logger.info({ jobId: job.id }, 'notificationQueue: completed'))
  .on('failed', (job, err) =>
    logger.error({ jobId: job.id, err: err.message }, 'notificationQueue: failed'),
  );
