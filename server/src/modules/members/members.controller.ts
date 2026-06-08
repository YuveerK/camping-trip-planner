import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { membersService } from './members.service';

export const getMembers = catchAsync(async (req: Request, res: Response) => {
  const members = await membersService.getMembers(req.params['tripId']!);
  res.json({ status: 'success', data: members });
});

export const addMember = catchAsync(async (req: Request, res: Response) => {
  const member = await membersService.addMember(req.params['tripId']!, req.body);
  res.status(201).json({ status: 'success', data: member });
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
  await membersService.removeMember(req.params['tripId']!, req.params['memberId']!);
  res.status(204).send();
});
