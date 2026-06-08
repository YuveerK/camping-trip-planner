import { Response } from 'express';
import { MealsService } from '../services/meals.service';
import { AuthRequest } from '../middleware/auth.middleware';
import * as R from '../utils/response';

const mealsService = new MealsService();

export async function getMeals(req: AuthRequest, res: Response) {
  try {
    const meals = await mealsService.getMeals(req.params['tripId']!);
    return R.ok(res, meals);
  } catch {
    return R.serverError(res);
  }
}

export async function createMeal(req: AuthRequest, res: Response) {
  try {
    const meal = await mealsService.createMeal(req.params['tripId']!, req.user!.userId, req.body);
    return R.created(res, meal, 'Meal added');
  } catch {
    return R.serverError(res);
  }
}

export async function updateMeal(req: AuthRequest, res: Response) {
  try {
    const meal = await mealsService.updateMeal(req.params['tripId']!, req.params['mealId']!, req.body);
    return R.ok(res, meal, 'Meal updated');
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') return R.notFoundResponse(res);
    return R.serverError(res);
  }
}

export async function deleteMeal(req: AuthRequest, res: Response) {
  try {
    await mealsService.deleteMeal(req.params['tripId']!, req.params['mealId']!);
    return R.noContent(res);
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') return R.notFoundResponse(res);
    return R.serverError(res);
  }
}
