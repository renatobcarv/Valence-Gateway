import Bull from 'bull';
import { env } from '../config';

const redisUrl = env.REDIS_URL;

const defaultOpts = {
  redis: redisUrl,
} as const;

export const splitQueue = new Bull('calculateSplits', {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const transferQueue = new Bull('sendTransfer', {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

export const notificationQueue = new Bull('sendEmail', {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
