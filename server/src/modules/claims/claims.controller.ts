import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { claimsService } from './claims.service';

export const createClaim = catchAsync(async (req: Request, res: Response) => {
  const claim = await claimsService.createClaim(req.params['itemId'] as string, req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: claim });
});

export const updateClaim = catchAsync(async (req: Request, res: Response) => {
  const claim = await claimsService.updateClaim(
    req.params['itemId'] as string,
    req.params['claimId'] as string,
    req.user!.userId,
    req.body,
  );
  res.json({ status: 'success', data: claim });
});

export const deleteClaim = catchAsync(async (req: Request, res: Response) => {
  await claimsService.deleteClaim(req.params['itemId'] as string, req.params['claimId'] as string, req.user!.userId);
  res.status(204).send();
});

export const togglePacked = catchAsync(async (req: Request, res: Response) => {
  const claim = await claimsService.togglePacked(
    req.params['itemId'] as string,
    req.params['claimId'] as string,
    req.user!.userId,
  );
  res.json({ status: 'success', data: claim });
});
