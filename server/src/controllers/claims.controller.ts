import { Response } from 'express';
import { ClaimsService } from '../services/claims.service';
import { AuthRequest } from '../middleware/auth.middleware';
import * as R from '../utils/response';

const claimsService = new ClaimsService();

export async function createClaim(req: AuthRequest, res: Response) {
  try {
    const claim = await claimsService.createClaim(req.params['itemId']!, req.user!.userId, req.body);
    return R.created(res, claim, 'Item claimed successfully');
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'ALREADY_CLAIMED') return R.conflict(res, 'You have already claimed this item');
      if (err.message === 'ITEM_NOT_FOUND') return R.notFoundResponse(res, 'Item not found');
      if (err.message === 'NOT_MEMBER') return R.forbidden(res, 'You are not a member of this trip');
      if (err.message.startsWith('EXCEEDS_REQUIRED:')) {
        const remaining = err.message.split(':')[1];
        return R.badRequest(res, `Only ${remaining} more needed. Reduce your claimed quantity.`);
      }
    }
    return R.serverError(res);
  }
}

export async function updateClaim(req: AuthRequest, res: Response) {
  try {
    const claim = await claimsService.updateClaim(req.params['itemId']!, req.params['claimId']!, req.user!.userId, req.body);
    return R.ok(res, claim, 'Claim updated');
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'NOT_FOUND') return R.notFoundResponse(res);
      if (err.message === 'FORBIDDEN') return R.forbidden(res);
    }
    return R.serverError(res);
  }
}

export async function deleteClaim(req: AuthRequest, res: Response) {
  try {
    await claimsService.deleteClaim(req.params['itemId']!, req.params['claimId']!, req.user!.userId);
    return R.noContent(res);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'NOT_FOUND') return R.notFoundResponse(res);
      if (err.message === 'FORBIDDEN') return R.forbidden(res);
    }
    return R.serverError(res);
  }
}

export async function togglePacked(req: AuthRequest, res: Response) {
  try {
    const claim = await claimsService.togglePacked(req.params['itemId']!, req.params['claimId']!, req.user!.userId);
    return R.ok(res, claim, claim.isPacked ? 'Marked as packed' : 'Marked as unpacked');
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'NOT_FOUND') return R.notFoundResponse(res);
      if (err.message === 'FORBIDDEN') return R.forbidden(res);
    }
    return R.serverError(res);
  }
}
