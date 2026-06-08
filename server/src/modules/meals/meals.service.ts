import { mealsRepository } from './meals.repository';
import { AppError } from '../../utils/AppError';
import type { CreateMealInput, UpdateMealInput } from './meals.schema';

export const mealsService = {
  getMeals: (tripId: string) => mealsRepository.findAll(tripId),

  createMeal: (tripId: string, userId: string, input: CreateMealInput) =>
    mealsRepository.create(tripId, userId, input),

  async updateMeal(tripId: string, mealId: string, input: UpdateMealInput) {
    const meal = await mealsRepository.findById(mealId, tripId);
    if (!meal) throw new AppError(404, 'Meal not found');
    return mealsRepository.update(mealId, input);
  },

  async deleteMeal(tripId: string, mealId: string) {
    const meal = await mealsRepository.findById(mealId, tripId);
    if (!meal) throw new AppError(404, 'Meal not found');
    return mealsRepository.delete(mealId);
  },
};
