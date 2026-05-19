import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  if (err instanceof ZodError) {
    const details: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      details[path] = issue.message;
    }
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details,
    });
    return;
  }

  const requestId = req.headers['x-request-id'] ?? 'unknown';
  logger.error({ err, requestId }, 'Unhandled error');

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    requestId,
  });
}
