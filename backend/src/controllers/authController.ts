import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services';
import { registerSchema, loginSchema } from '../utils/validators';
import type { AuthRequest } from '../types';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = registerSchema.parse(req.body);
      const result = await authService.register(body.email, body.password, body.name);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = loginSchema.parse(req.body);
      const result = await authService.login(body.email, body.password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = z.object({
        name: z.string().min(2).optional(),
        stripeAccountId: z.string().startsWith('acct_').optional(),
      }).parse(req.body);
      const user = await authService.updateProfile(req.user!.sub, body);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      }).parse(req.body);
      await authService.changePassword(req.user!.sub, body.currentPassword, body.newPassword);
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  },
};
