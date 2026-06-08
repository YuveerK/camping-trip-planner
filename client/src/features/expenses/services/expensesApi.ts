import api from '../../../config/api';
import type { ApiResponse, ExpenseSummary, Expense } from '../../../types';

export interface CreateExpensePayload {
  title: string;
  amount: number;
  paidByMemberId: string;
  splitType?: 'EQUAL' | 'CUSTOM';
  notes?: string;
}

export const expensesApi = {
  getAll: (tripId: string) =>
    api.get<ApiResponse<ExpenseSummary>>(`/trips/${tripId}/expenses`).then((r) => r.data),
  create: (tripId: string, data: CreateExpensePayload) =>
    api.post<ApiResponse<Expense>>(`/trips/${tripId}/expenses`, data).then((r) => r.data),
  update: (tripId: string, expenseId: string, data: Partial<CreateExpensePayload>) =>
    api.patch<ApiResponse<Expense>>(`/trips/${tripId}/expenses/${expenseId}`, data).then((r) => r.data),
  delete: (tripId: string, expenseId: string) =>
    api.delete(`/trips/${tripId}/expenses/${expenseId}`),
};
