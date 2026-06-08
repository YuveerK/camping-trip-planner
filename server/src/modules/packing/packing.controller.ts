import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { packingService } from './packing.service';

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await packingService.getCategories(req.params['tripId']!);
  res.json({ status: 'success', data: categories });
});

export const getItems = catchAsync(async (req: Request, res: Response) => {
  const items = await packingService.getItems(req.params['tripId']!);
  res.json({ status: 'success', data: items });
});

export const getMissingItems = catchAsync(async (req: Request, res: Response) => {
  const items = await packingService.getMissingItems(req.params['tripId']!);
  res.json({ status: 'success', data: items });
});

export const createItem = catchAsync(async (req: Request, res: Response) => {
  const item = await packingService.createItem(req.params['tripId']!, req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: item });
});

export const updateItem = catchAsync(async (req: Request, res: Response) => {
  const item = await packingService.updateItem(req.params['tripId']!, req.params['itemId']!, req.body);
  res.json({ status: 'success', data: item });
});

export const deleteItem = catchAsync(async (req: Request, res: Response) => {
  await packingService.deleteItem(req.params['tripId']!, req.params['itemId']!);
  res.status(204).send();
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await packingService.createCategory(req.params['tripId']!, req.body);
  res.status(201).json({ status: 'success', data: category });
});
