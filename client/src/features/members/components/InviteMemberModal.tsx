import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse, TripMember } from '../../../types';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { tripsKeys } from '../../trips/hooks/useTrips';
import { membersKeys } from '../hooks/useMembers';
import { membersApi } from '../services/membersApi';

const inviteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export function InviteMemberModal({ open, onClose, tripId }: InviteMemberModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const addMutation = useMutation({
    mutationFn: (data: InviteFormData) => membersApi.add(tripId, data),
    onSuccess: (data) => {
      const key = membersKeys.list(tripId);
      queryClient.setQueryData<ApiResponse<TripMember[]>>(key, (old) =>
        old ? { ...old, data: [...old.data, data.data] } : old,
      );
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) });
      toast.success('Member added!');
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add member';
      toast.error(msg);
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Invite member">
      <form onSubmit={handleSubmit((data) => addMutation.mutate(data))} className="flex flex-col gap-4">
        <p className="text-sm text-stone-500">
          If they already have an account, they will be added immediately. Otherwise, they will be stored as a pending invite.
        </p>
        <Input label="Name *" placeholder="Their full name" error={errors.name?.message} {...register('name')} />
        <Input label="Email *" type="email" placeholder="their@email.com" error={errors.email?.message} {...register('email')} />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
          <Button type="submit" loading={addMutation.isPending} fullWidth>Add member</Button>
        </div>
      </form>
    </Modal>
  );
}
