import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpensePayload) => expensesApi.create(tripId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesKeys.summary(tripId) });
      toast.success('Expense added');
      onCreated?.();
    },
    onError: () => toast.error('Failed to add expense'),
  });
}

export function useDeleteExpense(tripId: string | undefined, onDeleted?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => expensesApi.delete(tripId!, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesKeys.summary(tripId) });
      toast.success('Expense deleted');
      onDeleted?.();
    },
    onError: () => toast.error('Failed to delete expense'),
  });
}
