import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { tripsApi } from '../../api/trips';
import { MainLayout } from '../../layouts/MainLayout';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  campsiteName: z.string().optional(),
  location: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  description: z.string().optional(),
  bookingReference: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CreateTripPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => tripsApi.create({
      ...data,
      checkInDate: data.checkInDate ? new Date(data.checkInDate).toISOString() : undefined,
      checkOutDate: data.checkOutDate ? new Date(data.checkOutDate).toISOString() : undefined,
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created! 🏕️');
      navigate(`/trips/${res.data.id}`);
    },
    onError: () => {
      toast.error('Failed to create trip');
    },
  });

  return (
    <MainLayout>
      <div className="page-container pt-6">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/trips" className="text-stone-400 hover:text-stone-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-stone-800">New Trip</h1>
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))}>
          <Card className="mb-4">
            <CardHeader>
              <h2 className="text-sm font-semibold text-stone-600">Trip details</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <Input
                label="Trip name *"
                placeholder="Weekend Braai at Magalies"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Campsite name"
                placeholder="Magalies Mountain Lodge"
                {...register('campsiteName')}
              />
              <Input
                label="Location"
                placeholder="Magaliesburg, South Africa"
                {...register('location')}
              />
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <h2 className="text-sm font-semibold text-stone-600">Dates</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <Input
                label="Check-in date"
                type="date"
                {...register('checkInDate')}
              />
              <Input
                label="Check-out date"
                type="date"
                {...register('checkOutDate')}
              />
            </CardBody>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-sm font-semibold text-stone-600">Extra info</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <Textarea
                label="Description"
                placeholder="Tell the crew what this trip is about..."
                {...register('description')}
              />
              <Input
                label="Booking reference"
                placeholder="e.g. BK-12345"
                {...register('bookingReference')}
              />
            </CardBody>
          </Card>

          <Button type="submit" fullWidth size="lg" loading={isPending}>
            Create trip
          </Button>
        </form>
      </div>
    </MainLayout>
  );
}
