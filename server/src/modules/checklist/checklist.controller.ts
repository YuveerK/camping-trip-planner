import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { checklistService } from './checklist.service';

export const getItems = catchAsync(async (req: Request, res: Response) => {
  const items = await checklistService.getItems(req.params['tripId']!, req.user!.userId);
  res.json({ status: 'success', data: items });
});

export const createItem = catchAsync(async (req: Request, res: Response) => {
  const item = await checklistService.createItem(req.params['tripId']!, req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: item });
});

export const updateItem = catchAsync(async (req: Request, res: Response) => {
  const item = await checklistService.updateItem(
    req.params['tripId']!,
    req.user!.userId,
    req.params['itemId']!,
    req.body,
  );
  res.json({ status: 'success', data: item });
});

export const deleteItem = catchAsync(async (req: Request, res: Response) => {
  await checklistService.deleteItem(req.params['tripId']!, req.user!.userId, req.params['itemId']!);
  res.status(204).send();
});
