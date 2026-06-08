import type { Meal } from '../../../types';
import type { CreateMealPayload } from '../services/mealsApi';

export function toMealFormValues(meal: Meal): CreateMealPayload {
  return {
    title: meal.title,
    description: meal.description ?? '',
    mealDate: meal.mealDate.slice(0, 10),
    mealType: meal.mealType,
    assignedToMemberId: meal.assignedToMemberId ?? '',
  };
}
