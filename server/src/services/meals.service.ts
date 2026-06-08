import { prisma } from '../config/database';
import type { CreateMealInput, UpdateMealInput } from '../validators/meals.validators';

const MEAL_INCLUDE = {
  assignedTo: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  createdBy: { select: { id: true, name: true } },
};

export class MealsService {
  async getMeals(tripId: string) {
    return prisma.meal.findMany({
      where: { tripId },
      include: MEAL_INCLUDE,
      orderBy: [{ mealDate: 'asc' }, { mealType: 'asc' }],
    });
  }

  async createMeal(tripId: string, userId: string, input: CreateMealInput) {
    return prisma.meal.create({
      data: {
        ...input,
        mealDate: new Date(input.mealDate),
        tripId,
        createdById: userId,
      },
      include: MEAL_INCLUDE,
    });
  }

  async updateMeal(tripId: string, mealId: string, input: UpdateMealInput) {
    const meal = await prisma.meal.findFirst({ where: { id: mealId, tripId } });
    if (!meal) throw new Error('NOT_FOUND');
    return prisma.meal.update({
      where: { id: mealId },
      data: {
        ...input,
        mealDate: input.mealDate ? new Date(input.mealDate) : undefined,
      },
      include: MEAL_INCLUDE,
    });
  }

  async deleteMeal(tripId: string, mealId: string) {
    const meal = await prisma.meal.findFirst({ where: { id: mealId, tripId } });
    if (!meal) throw new Error('NOT_FOUND');
    return prisma.meal.delete({ where: { id: mealId } });
  }
}
