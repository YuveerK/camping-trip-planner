import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ status: 'fail', errors: err.flatten().fieldErrors });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: 'fail', message: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ status: 'fail', message: 'Resource already exists' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ status: 'fail', message: 'Invalid reference: related record does not exist' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ status: 'fail', message: 'Record not found' });
      return;
    }
  }

  console.error('UNEXPECTED ERROR', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    ...(env.NODE_ENV === 'development' && { detail: String(err) }),
  });
}
