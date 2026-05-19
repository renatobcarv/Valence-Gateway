import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const addCollaboratorSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  percentage: z.number().min(0.01).max(100),
  stripeAccountId: z.string().startsWith('acct_').optional(),
});

export const updateCollaboratorSchema = z.object({
  percentage: z.number().min(0.01).max(100).optional(),
  stripeAccountId: z.string().startsWith('acct_').optional(),
});

export const createPaymentSchema = z.object({
  amount: z.number().min(0.5),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
