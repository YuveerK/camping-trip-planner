import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { tripsApi } from '../../api/trips';
import { TripLayout } from '../../layouts/TripLayout';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

export function TripSettingsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getOne(tripId!),
  });

  const trip = data?.data;
  const isOwner = trip?.createdById === user?.id;

  const { register, handleSubmit } = useForm({
    values: trip
      ? {
          name: trip.name,
          campsiteName: trip.campsiteName ?? '',
          location: trip.location ?? '',
          checkInDate: trip.checkInDate ? trip.checkInDate.slice(0, 10) : '',
          checkOutDate: trip.checkOutDate ? trip.checkOutDate.slice(0, 10) : '',
          description: trip.description ?? '',
          bookingReference: trip.bookingReference ?? '',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) =>
      tripsApi.update(tripId!, {
        ...data,
        checkInDate: data['checkInDate'] ? new Date(data['checkInDate']).toISOString() : null,
        checkOutDate: data['checkOutDate'] ? new Date(data['checkOutDate']).toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip updated');
    },
    onError: () => toast.error('Failed to update trip'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tripsApi.delete(tripId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted');
      navigate('/trips');
    },
  });

  if (isLoading) return <TripLayout><PageLoader /></TripLayout>;

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Trip Settings</h2>

        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d as Record<string, string>))}>
          <Card className="mb-4">
            <CardHeader>
              <h3 className="text-sm font-semibold text-stone-600">Details</h3>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <Input label="Trip name" {...register('name')} />
              <Input label="Campsite name" {...register('campsiteName')} />
              <Input label="Location" {...register('location')} />
              <Input label="Check-in" type="date" {...register('checkInDate')} />
              <Input label="Check-out" type="date" {...register('checkOutDate')} />
              <Textarea label="Description" {...register('description')} />
              <Input label="Booking reference" {...register('bookingReference')} />
            </CardBody>
          </Card>

          {isOwner && (
            <Button type="submit" fullWidth loading={updateMutation.isPending}>
              Save changes
            </Button>
          )}
        </form>

        {isOwner && (
          <div className="mt-8">
            <Card className="border-red-100">
              <CardHeader>
                <h3 className="text-sm font-semibold text-red-600">Danger zone</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-stone-500 mb-3">
                  Deleting this trip will permanently remove all packing items, tasks, meals, and expenses. This cannot be undone.
                </p>
                <Button variant="danger" onClick={() => setShowDelete(true)}>
                  Delete trip
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        title="Delete trip"
        message={`Are you absolutely sure you want to delete "${trip?.name}"? This will remove everything and cannot be undone.`}
        confirmLabel="Yes, delete trip"
      />
    </TripLayout>
  );
}
