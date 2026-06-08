import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Input, Textarea } from '../../../components/ui/Input';
import type { CreateTripPayload } from '../services/tripsApi';

const schema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  campsiteName: z.string().optional(),
  location: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  description: z.string().optional(),
  bookingReference: z.string().optional(),
});

export type CreateTripFormData = z.infer<typeof schema>;

interface CreateTripFormProps {
  isPending: boolean;
  onSubmit: (data: CreateTripPayload) => void;
}

export function CreateTripForm({ isPending, onSubmit }: CreateTripFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTripFormData>({
    resolver: zodResolver(schema),
  });

  function normalize(data: CreateTripFormData): CreateTripPayload {
    return {
      ...data,
      checkInDate: data.checkInDate ? new Date(data.checkInDate).toISOString() : undefined,
      checkOutDate: data.checkOutDate ? new Date(data.checkOutDate).toISOString() : undefined,
    };
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(normalize(data)))}>
      <Card className="mb-4">
        <CardHeader><h2 className="text-sm font-semibold text-stone-600">Trip details</h2></CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Input label="Trip name *" placeholder="Weekend Braai at Magalies" error={errors.name?.message} {...register('name')} />
          <Input label="Campsite name" placeholder="Magalies Mountain Lodge" {...register('campsiteName')} />
          <Input label="Location" placeholder="Magaliesburg, South Africa" {...register('location')} />
        </CardBody>
      </Card>
      <Card className="mb-4">
        <CardHeader><h2 className="text-sm font-semibold text-stone-600">Dates</h2></CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Input label="Check-in date" type="date" {...register('checkInDate')} />
          <Input label="Check-out date" type="date" {...register('checkOutDate')} />
        </CardBody>
      </Card>
      <Card className="mb-6">
        <CardHeader><h2 className="text-sm font-semibold text-stone-600">Extra info</h2></CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Textarea label="Description" placeholder="Tell the crew what this trip is about..." {...register('description')} />
          <Input label="Booking reference" placeholder="e.g. BK-12345" {...register('bookingReference')} />
        </CardBody>
      </Card>
      <Button type="submit" fullWidth size="lg" loading={isPending}>Create trip</Button>
    </form>
  );
}
