import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { ApiResponse, Meal } from '../../../types';
import { mealsApi } from '../services/mealsApi';

export const mealsKeys = {
  list: (tripId: string | undefined) => ['meals', tripId] as const,
};

export function useMeals(tripId: string | undefined) {
  return useQuery({
    queryKey: mealsKeys.list(tripId),
    queryFn: () => mealsApi.getAll(tripId!),
    enabled: !!tripId,
  });
}

export function useDeleteMeal(tripId: string | undefined, onDeleted?: () => void) {
  const qc = useQueryClient();
  const key = mealsKeys.list(tripId);

  return useMutation({
    mutationFn: (mealId: string) => mealsApi.delete(tripId!, mealId),
    onMutate: async (mealId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData<ApiResponse<Meal[]>>(key, (old) =>
        old ? { ...old, data: old.data.filter((m) => m.id !== mealId) } : old,
      );
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) qc.setQueryData(key, context.prev);
      toast.error('Failed to remove meal');
    },
    onSuccess: () => { toast.success('Meal removed'); onDeleted?.(); },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
