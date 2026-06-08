import { Response } from 'express';
import { MembersService } from '../services/members.service';
import { AuthRequest } from '../middleware/auth.middleware';
import * as R from '../utils/response';

const membersService = new MembersService();

export async function getMembers(req: AuthRequest, res: Response) {
  try {
    const members = await membersService.getMembers(req.params['tripId']!);
    return R.ok(res, members);
  } catch {
    return R.serverError(res);
  }
}

export async function addMember(req: AuthRequest, res: Response) {
  try {
    const member = await membersService.addMember(req.params['tripId']!, req.body);
    return R.created(res, member, 'Member added');
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'ALREADY_MEMBER') return R.conflict(res, 'This user is already a member of this trip');
      if (err.message === 'ALREADY_INVITED') return R.conflict(res, 'This email has already been invited');
    }
    return R.serverError(res);
  }
}

export async function removeMember(req: AuthRequest, res: Response) {
  try {
    await membersService.removeMember(req.params['tripId']!, req.params['memberId']!);
    return R.noContent(res);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'NOT_FOUND') return R.notFoundResponse(res, 'Member not found');
      if (err.message === 'CANNOT_REMOVE_OWNER') return R.forbidden(res, 'Cannot remove the trip owner');
    }
    return R.serverError(res);
  }
}
