import Stripe from 'stripe';
import { env } from './env';

export const stripe: InstanceType<typeof Stripe> = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
});
