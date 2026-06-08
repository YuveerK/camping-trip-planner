import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { checklistService } from './checklist.service';

// ── Checklist ────────────────────────────────────────────────────────────────

export const getItems = catchAsync(async (req: Request, res: Response) => {
  const data = await checklistService.getItems(req.params['tripId'] as string, req.user!.userId);
  res.json({ status: 'success', data });
});

// ── Categories ───────────────────────────────────────────────────────────────

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await checklistService.createCategory(req.params['tripId'] as string, req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: category });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await checklistService.updateCategory(
    req.params['tripId'] as string,
    req.user!.userId,
    req.params['categoryId'] as string,
    req.body,
  );
  res.json({ status: 'success', data: category });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await checklistService.deleteCategory(req.params['tripId'] as string, req.user!.userId, req.params['categoryId'] as string);
  res.status(204).send();
});

// ── Items ────────────────────────────────────────────────────────────────────

export const createItem = catchAsync(async (req: Request, res: Response) => {
  const item = await checklistService.createItem(req.params['tripId'] as string, req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: item });
});

export const updateItem = catchAsync(async (req: Request, res: Response) => {
  const item = await checklistService.updateItem(
    req.params['tripId'] as string,
    req.user!.userId,
    req.params['itemId'] as string,
    req.body,
  );
  res.json({ status: 'success', data: item });
});

export const deleteItem = catchAsync(async (req: Request, res: Response) => {
  await checklistService.deleteItem(req.params['tripId'] as string, req.user!.userId, req.params['itemId'] as string);
  res.status(204).send();
});

// ── Visibility ───────────────────────────────────────────────────────────────

export const setVisibility = catchAsync(async (req: Request, res: Response) => {
  const result = await checklistService.setVisibility(req.params['tripId'] as string, req.user!.userId, req.body.isPublic);
  res.json({ status: 'success', data: result });
});

export const getOwnerItems = catchAsync(async (req: Request, res: Response) => {
  const data = await checklistService.getOwnerItems(req.params['tripId'] as string, req.user!.userId);
  res.json({ status: 'success', data });
});
