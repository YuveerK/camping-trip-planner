import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';
import { AppError } from '../utils/AppError';

export function requireTripAccess(req: Request, _res: Response, next: NextFunction): void {
  const tripId = req.params['tripId'] as string;
  const userId = req.user!.userId;

  prisma.tripMember
    .findFirst({ where: { tripId, userId, isPending: false } })
    .then((member) => {
      if (!member) return next(new AppError(404, 'Trip not found or access denied'));
      req.tripMember = { id: member.id, role: member.role };
      next();
    })
    .catch(next);
}

export function requireOwner(req: Request, _res: Response, next: NextFunction): void {
  if (req.tripMember?.role !== 'OWNER') {
    return next(new AppError(403, 'Only the trip owner can perform this action'));
  }
  next();
}


