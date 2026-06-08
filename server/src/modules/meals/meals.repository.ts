import { prisma } from '../../db/client';
import type { CreateMealInput, UpdateMealInput } from './meals.schema';

const MEAL_INCLUDE = {
  assignedTo: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  createdBy: { select: { id: true, name: true } },
};

export const mealsRepository = {
  findAll: (tripId: string) =>
    prisma.meal.findMany({
      where: { tripId },
      include: MEAL_INCLUDE,
      orderBy: [{ mealDate: 'asc' }, { mealType: 'asc' }],
    }),

  findById: (mealId: string, tripId: string) =>
    prisma.meal.findFirst({ where: { id: mealId, tripId } }),

  create: (tripId: string, userId: string, input: CreateMealInput) =>
    prisma.meal.create({
      data: { ...input, mealDate: new Date(input.mealDate), tripId, createdById: userId },
      include: MEAL_INCLUDE,
    }),

  update: (mealId: string, input: UpdateMealInput) =>
    prisma.meal.update({
      where: { id: mealId },
      data: {
        ...input,
        mealDate: input.mealDate ? new Date(input.mealDate) : undefined,
      },
      include: MEAL_INCLUDE,
    }),

  delete: (mealId: string) =>
    prisma.meal.delete({ where: { id: mealId } }),
};
