import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { paginationSchema } from '../utils/validators';
import { z } from 'zod';
import type { AuthRequest } from '../types';

const transfersQuerySchema = paginationSchema.extend({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

export const dashboardController = {
  async earnings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getEarnings(req.user!.sub);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async transfers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit, offset, status } = transfersQuerySchema.parse(req.query);
      const data = await dashboardService.getTransfers(req.user!.sub, limit, offset, status);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async revenueChart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getRevenueChart(req.user!.sub);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
