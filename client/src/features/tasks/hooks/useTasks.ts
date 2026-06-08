import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { ApiResponse, Task } from '../../../types';
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
  const qc = useQueryClient();
  const key = tasksKeys.list(tripId);

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(tripId!, taskId),
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData<ApiResponse<Task[]>>(key, (old) =>
        old ? { ...old, data: old.data.filter((t) => t.id !== taskId) } : old,
      );
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) qc.setQueryData(key, context.prev);
      toast.error('Failed to delete task');
    },
    onSuccess: () => { toast.success('Task deleted'); onDeleted?.(); },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
