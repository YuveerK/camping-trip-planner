import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { ApiResponse, Trip } from '../../../types';
import { tripsApi, type CreateTripPayload } from '../services/tripsApi';

export const tripsKeys = {
  all: ['trips'] as const,
  detail: (tripId: string | undefined) => ['trip', tripId] as const,
};

export function useTrips() {
  return useQuery({
    queryKey: tripsKeys.all,
    queryFn: tripsApi.getAll,
  });
}

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: tripsKeys.detail(tripId),
    queryFn: () => tripsApi.getOne(tripId!),
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateTripPayload) => tripsApi.create(data),
    onSuccess: (data) => {
      qc.setQueryData<ApiResponse<Trip[]>>(tripsKeys.all, (old) =>
        old ? { ...old, data: [...old.data, data.data] } : old,
      );
      qc.invalidateQueries({ queryKey: tripsKeys.all });
      toast.success('Trip created');
      navigate(`/trips/${data.data.id}`);
    },
    onError: () => toast.error('Failed to create trip'),
  });
}

export function useUpdateTrip(tripId: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, string>) =>
      tripsApi.update(tripId!, {
        ...data,
        checkInDate: data.checkInDate ? new Date(data.checkInDate).toISOString() : null,
        checkOutDate: data.checkOutDate ? new Date(data.checkOutDate).toISOString() : null,
      }),
    onSuccess: (data) => {
      qc.setQueryData(tripsKeys.detail(tripId), data);
      qc.setQueryData<ApiResponse<Trip[]>>(tripsKeys.all, (old) =>
        old ? { ...old, data: old.data.map((t) => t.id === tripId ? data.data : t) } : old,
      );
      qc.invalidateQueries({ queryKey: tripsKeys.detail(tripId) });
      qc.invalidateQueries({ queryKey: tripsKeys.all });
      toast.success('Trip updated');
    },
    onError: () => toast.error('Failed to update trip'),
  });
}

export function useDeleteTrip(tripId: string | undefined) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => tripsApi.delete(tripId!),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: tripsKeys.all });
      const prev = qc.getQueryData(tripsKeys.all);
      qc.setQueryData<ApiResponse<Trip[]>>(tripsKeys.all, (old) =>
        old ? { ...old, data: old.data.filter((t) => t.id !== tripId) } : old,
      );
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) qc.setQueryData(tripsKeys.all, context.prev);
      toast.error('Failed to delete trip');
    },
    onSuccess: () => {
      toast.success('Trip deleted');
      navigate('/trips');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tripsKeys.all }),
  });
}
