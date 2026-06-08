import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { ApiResponse, ExpenseSummary } from '../../../types';
import { expensesApi, type CreateExpensePayload } from '../services/expensesApi';

export const expensesKeys = {
  summary: (tripId: string | undefined) => ['expenses', tripId] as const,
};

export function useExpenseSummary(tripId: string | undefined) {
  return useQuery({
    queryKey: expensesKeys.summary(tripId),
    queryFn: () => expensesApi.getAll(tripId!),
    enabled: !!tripId,
  });
}

export function useCreateExpense(tripId: string | undefined, onCreated?: () => void) {
  const qc = useQueryClient();
  const key = expensesKeys.summary(tripId);

  return useMutation({
    mutationFn: (data: CreateExpensePayload) => expensesApi.create(tripId!, data),
    onSuccess: (data) => {
      // Add the new expense to the list immediately; totals update on background refetch
      qc.setQueryData<ApiResponse<ExpenseSummary>>(key, (old) =>
        old ? { ...old, data: { ...old.data, expenses: [...old.data.expenses, data.data] } } : old,
      );
      qc.invalidateQueries({ queryKey: key });
      toast.success('Expense added');
      onCreated?.();
    },
    onError: () => toast.error('Failed to add expense'),
  });
}

export function useDeleteExpense(tripId: string | undefined, onDeleted?: () => void) {
  const qc = useQueryClient();
  const key = expensesKeys.summary(tripId);

  return useMutation({
    mutationFn: (expenseId: string) => expensesApi.delete(tripId!, expenseId),
    onMutate: async (expenseId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData<ApiResponse<ExpenseSummary>>(key, (old) =>
        old ? { ...old, data: { ...old.data, expenses: old.data.expenses.filter((e) => e.id !== expenseId) } } : old,
      );
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) qc.setQueryData(key, context.prev);
      toast.error('Failed to delete expense');
    },
    onSuccess: () => { toast.success('Expense deleted'); onDeleted?.(); },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
