import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Input, Textarea } from '../../../components/ui/Input';
import type { Trip } from '../../../types';

interface TripSettingsFormProps {
  trip?: Trip;
  isOwner: boolean;
  isPending: boolean;
  onSubmit: (data: Record<string, string>) => void;
}

export function TripSettingsForm({ trip, isOwner, isPending, onSubmit }: TripSettingsFormProps) {
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

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as Record<string, string>))}>
      <Card className="mb-4">
        <CardHeader><h3 className="text-sm font-semibold text-stone-600">Details</h3></CardHeader>
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
      {isOwner && <Button type="submit" fullWidth loading={isPending}>Save changes</Button>}
    </form>
  );
}
