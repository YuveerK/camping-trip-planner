import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateTripPayload) => tripsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.all });
      toast.success('Trip created');
      navigate(`/trips/${response.data.id}`);
    },
    onError: () => toast.error('Failed to create trip'),
  });
}

export function useUpdateTrip(tripId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, string>) =>
      tripsApi.update(tripId!, {
        ...data,
        checkInDate: data.checkInDate ? new Date(data.checkInDate).toISOString() : null,
        checkOutDate: data.checkOutDate ? new Date(data.checkOutDate).toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: tripsKeys.all });
      toast.success('Trip updated');
    },
    onError: () => toast.error('Failed to update trip'),
  });
}

export function useDeleteTrip(tripId: string | undefined) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => tripsApi.delete(tripId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.all });
      toast.success('Trip deleted');
      navigate('/trips');
    },
    onError: () => toast.error('Failed to delete trip'),
  });
}
