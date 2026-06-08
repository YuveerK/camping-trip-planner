import { expensesRepository } from './expenses.repository';
import { AppError } from '../../utils/AppError';
import type { CreateExpenseInput, UpdateExpenseInput } from './expenses.schema';

export const expensesService = {
  async getExpenses(tripId: string) {
    const expenses = await expensesRepository.findAll(tripId);
    const members = await expensesRepository.findMembers(tripId);
    const activeMembers = members.filter((m) => !m.isPending);
    const memberCount = activeMembers.length || 1;
    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const perMemberBalance: Record<string, { memberId: string; name: string; paid: number; owes: number; net: number }> = {};
    for (const m of activeMembers) {
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
  },

  async createExpense(tripId: string, input: CreateExpenseInput) {
    const member = await expensesRepository.findMemberById(input.paidByMemberId, tripId);
    if (!member) throw new AppError(400, 'Invalid member selected');
    return expensesRepository.create(tripId, input);
  },

  async updateExpense(tripId: string, expenseId: string, input: UpdateExpenseInput) {
    const expense = await expensesRepository.findById(expenseId, tripId);
    if (!expense) throw new AppError(404, 'Expense not found');
    return expensesRepository.update(expenseId, input);
  },

  async deleteExpense(tripId: string, expenseId: string) {
    const expense = await expensesRepository.findById(expenseId, tripId);
    if (!expense) throw new AppError(404, 'Expense not found');
    return expensesRepository.delete(expenseId);
  },
};
