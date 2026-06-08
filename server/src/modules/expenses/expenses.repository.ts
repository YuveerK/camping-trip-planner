import { prisma } from '../../db/client';
import type { CreateExpenseInput, UpdateExpenseInput } from './expenses.schema';

const EXPENSE_INCLUDE = {
  paidBy: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
};

export const expensesRepository = {
  findAll: (tripId: string) =>
    prisma.expense.findMany({
      where: { tripId },
      include: EXPENSE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    }),

  findMembers: (tripId: string) =>
    prisma.tripMember.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),

  findMemberById: (id: string, tripId: string) =>
    prisma.tripMember.findFirst({ where: { id, tripId } }),

  findById: (expenseId: string, tripId: string) =>
    prisma.expense.findFirst({ where: { id: expenseId, tripId } }),

  create: (tripId: string, input: CreateExpenseInput) =>
    prisma.expense.create({
      data: { ...input, tripId },
      include: EXPENSE_INCLUDE,
    }),

  update: (expenseId: string, input: UpdateExpenseInput) =>
    prisma.expense.update({
      where: { id: expenseId },
      data: input,
      include: EXPENSE_INCLUDE,
    }),

  delete: (expenseId: string) =>
    prisma.expense.delete({ where: { id: expenseId } }),
};
