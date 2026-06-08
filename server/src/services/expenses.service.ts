import { prisma } from '../config/database';
import type { CreateExpenseInput, UpdateExpenseInput } from '../validators/expenses.validators';

const EXPENSE_INCLUDE = {
  paidBy: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
};

export class ExpensesService {
  async getExpenses(tripId: string) {
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      include: EXPENSE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    const members = await prisma.tripMember.findMany({
      where: { tripId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    const memberCount = members.filter((m) => !m.isPending).length || 1;

    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const perMemberBalance: Record<string, { memberId: string; name: string; paid: number; owes: number; net: number }> = {};
    for (const m of members.filter((m) => !m.isPending)) {
      const name = m.user?.name ?? m.invitedName ?? 'Unknown';
      perMemberBalance[m.id] = { memberId: m.id, name, paid: 0, owes: 0, net: 0 };
    }

    for (const expense of expenses) {
      const amount = Number(expense.amount);
      if (perMemberBalance[expense.paidByMemberId]) {
        perMemberBalance[expense.paidByMemberId]!.paid += amount;
      }
      const share = amount / memberCount;
      for (const key of Object.keys(perMemberBalance)) {
        perMemberBalance[key]!.owes += share;
      }
    }

    for (const key of Object.keys(perMemberBalance)) {
      const b = perMemberBalance[key]!;
      b.net = b.paid - b.owes;
    }

    return { expenses, totalAmount, perMemberBalance: Object.values(perMemberBalance) };
  }

  async createExpense(tripId: string, input: CreateExpenseInput) {
    const memberExists = await prisma.tripMember.findFirst({
      where: { id: input.paidByMemberId, tripId },
    });
    if (!memberExists) throw new Error('INVALID_MEMBER');

    return prisma.expense.create({
      data: { ...input, amount: input.amount, tripId },
      include: EXPENSE_INCLUDE,
    });
  }

  async updateExpense(tripId: string, expenseId: string, input: UpdateExpenseInput) {
    const expense = await prisma.expense.findFirst({ where: { id: expenseId, tripId } });
    if (!expense) throw new Error('NOT_FOUND');
    return prisma.expense.update({
      where: { id: expenseId },
      data: input,
      include: EXPENSE_INCLUDE,
    });
  }

  async deleteExpense(tripId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({ where: { id: expenseId, tripId } });
    if (!expense) throw new Error('NOT_FOUND');
    return prisma.expense.delete({ where: { id: expenseId } });
  }
}
