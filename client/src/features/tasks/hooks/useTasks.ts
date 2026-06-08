import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { tasksApi } from '../services/tasksApi';

export const tasksKeys = {
  list: (tripId: string | undefined) => ['tasks', tripId] as const,
};

export function useTasks(tripId: string | undefined) {
  return useQuery({
    queryKey: tasksKeys.list(tripId),
    queryFn: () => tasksApi.getAll(tripId!),
    enabled: !!tripId,
  });
}

export function useDeleteTask(tripId: string | undefined, onDeleted?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(tripId!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.list(tripId) });
      toast.success('Task deleted');
      onDeleted?.();
    },
    onError: () => toast.error('Failed to delete task'),
  });
}
