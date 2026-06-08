import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from './auth.middleware';
import { forbidden, notFoundResponse } from '../utils/response';

export interface TripRequest extends AuthRequest {
  tripMember?: { id: string; role: string };
}

export function requireTripAccess(req: TripRequest, res: Response, next: NextFunction): void {
  const tripId = req.params['tripId'];
  const userId = req.user!.userId;

  prisma.tripMember
    .findFirst({ where: { tripId, userId, isPending: false } })
    .then((member) => {
      if (!member) {
        notFoundResponse(res, 'Trip not found or access denied');
        return;
      }
      req.tripMember = { id: member.id, role: member.role };
      next();
    })
    .catch(next);
}

export function requireOwner(req: TripRequest, res: Response, next: NextFunction): void {
  if (req.tripMember?.role !== 'OWNER') {
    forbidden(res, 'Only the trip owner can perform this action');
    return;
  }
  next();
}
