import { Response } from 'express';
import { PackingService } from '../services/packing.service';
import { AuthRequest } from '../middleware/auth.middleware';
import * as R from '../utils/response';

const packingService = new PackingService();

export async function getCategories(req: AuthRequest, res: Response) {
  try {
    const categories = await packingService.getCategories(req.params['tripId']!);
    return R.ok(res, categories);
  } catch {
    return R.serverError(res);
  }
}

export async function getItems(req: AuthRequest, res: Response) {
  try {
    const items = await packingService.getItems(req.params['tripId']!);
    return R.ok(res, items);
  } catch {
    return R.serverError(res);
  }
}

export async function getMissingItems(req: AuthRequest, res: Response) {
  try {
    const items = await packingService.getMissingItems(req.params['tripId']!);
    return R.ok(res, items);
  } catch {
    return R.serverError(res);
  }
}

export async function createItem(req: AuthRequest, res: Response) {
  try {
    const item = await packingService.createItem(req.params['tripId']!, req.user!.userId, req.body);
    return R.created(res, item, 'Item added to packing list');
  } catch (err) {
    if (err instanceof Error && err.message === 'DUPLICATE_ITEM') {
      return R.conflict(res, 'This item already exists in the packing list. You can claim it instead.');
    }
    return R.serverError(res);
  }
}

export async function updateItem(req: AuthRequest, res: Response) {
  try {
    const item = await packingService.updateItem(req.params['tripId']!, req.params['itemId']!, req.body);
    return R.ok(res, item, 'Item updated');
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') return R.notFoundResponse(res);
    return R.serverError(res);
  }
}

export async function deleteItem(req: AuthRequest, res: Response) {
  try {
    await packingService.deleteItem(req.params['tripId']!, req.params['itemId']!);
    return R.noContent(res);
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') return R.notFoundResponse(res);
    return R.serverError(res);
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const category = await packingService.createCategory(req.params['tripId']!, req.body);
    return R.created(res, category, 'Category created');
  } catch {
    return R.serverError(res);
  }
}
