import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => membersApi.remove(tripId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKeys.list(tripId) });
      queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) });
      toast.success('Member removed');
      onRemoved?.();
    },
    onError: () => toast.error('Failed to remove member'),
  });
}
