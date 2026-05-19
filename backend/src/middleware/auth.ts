import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import { UnauthorizedError } from '../utils';
import type { AuthPayload, AuthRequest } from '../types';

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError());
  }
}
