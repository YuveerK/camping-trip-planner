import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { mealsService } from './meals.service';

export const getMeals = catchAsync(async (req: Request, res: Response) => {
  const meals = await mealsService.getMeals(req.params['tripId']!);
  res.json({ status: 'success', data: meals });
});

export const createMeal = catchAsync(async (req: Request, res: Response) => {
  const meal = await mealsService.createMeal(req.params['tripId']!, req.user!.userId, req.body);
  res.status(201).json({ status: 'success', data: meal });
});

export const updateMeal = catchAsync(async (req: Request, res: Response) => {
  const meal = await mealsService.updateMeal(req.params['tripId']!, req.params['mealId']!, req.body);
  res.json({ status: 'success', data: meal });
});

export const deleteMeal = catchAsync(async (req: Request, res: Response) => {
  await mealsService.deleteMeal(req.params['tripId']!, req.params['mealId']!);
  res.status(204).send();
});
