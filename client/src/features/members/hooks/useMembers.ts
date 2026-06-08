import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { ApiResponse, TripMember } from '../../../types';
import { tripsKeys } from '../../trips/hooks/useTrips';
import { membersApi } from '../services/membersApi';

export const membersKeys = {
  list: (tripId: string | undefined) => ['members', tripId] as const,
};

export function useMembers(tripId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: membersKeys.list(tripId),
    queryFn: () => membersApi.getAll(tripId!),
    enabled: enabled && !!tripId,
  });
}

export function useRemoveMember(tripId: string | undefined, onRemoved?: () => void) {
  const qc = useQueryClient();
  const key = membersKeys.list(tripId);

  return useMutation({
    mutationFn: (memberId: string) => membersApi.remove(tripId!, memberId),
    onMutate: async (memberId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData<ApiResponse<TripMember[]>>(key, (old) =>
        old ? { ...old, data: old.data.filter((m) => m.id !== memberId) } : old,
      );
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) qc.setQueryData(key, context.prev);
      toast.error('Failed to remove member');
    },
    onSuccess: () => { toast.success('Member removed'); onRemoved?.(); },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: tripsKeys.detail(tripId) });
    },
  });
}
