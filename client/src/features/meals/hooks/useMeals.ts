import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mealId: string) => mealsApi.delete(tripId!, mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealsKeys.list(tripId) });
      toast.success('Meal removed');
      onDeleted?.();
    },
    onError: () => toast.error('Failed to remove meal'),
  });
}
