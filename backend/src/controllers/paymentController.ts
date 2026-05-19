import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripeService';
import { prisma } from '../config';
import { createPaymentSchema, paginationSchema } from '../utils/validators';
import { z } from 'zod';
import type { AuthRequest } from '../types';

const listPaymentsQuerySchema = paginationSchema.extend({
  projectId: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
});

export const paymentController = {
  async createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params as { projectId: string };
      const body = createPaymentSchema.parse(req.body);

      const result = await stripeService.createPaymentIntent(
        projectId,
        body.amount,
        body.customerEmail,
        body.customerName,
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async listPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { limit, offset, projectId, status } = listPaymentsQuerySchema.parse(req.query);

      const where = {
        project: { userId },
        ...(projectId && { projectId }),
        ...(status && { status }),
      };

      const [payments, total] = await prisma.$transaction([
        prisma.payment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          include: {
            splits: {
              include: { collaborator: { select: { name: true } } },
            },
          },
        }),
        prisma.payment.count({ where }),
      ]);

      res.json({
        payments: payments.map((p) => ({
          id: p.id,
          projectId: p.projectId,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          stripeId: p.stripeId,
          createdAt: p.createdAt,
          splits: p.splits.map((s) => ({
            collaboratorName: s.collaborator.name,
            amount: s.amount,
            status: s.status,
          })),
        })),
        total,
      });
    } catch (err) {
      next(err);
    }
  },
};
