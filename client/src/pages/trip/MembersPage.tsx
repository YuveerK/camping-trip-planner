import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { membersApi } from '../../api/members';
import { TripLayout } from '../../layouts/TripLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { getMemberDisplayName } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import type { TripMember } from '../../types';
import { tripsApi } from '../../api/trips';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function MembersPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [removeMember, setRemoveMember] = useState<TripMember | null>(null);
  const queryClient = useQueryClient();

  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getOne(tripId!),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => membersApi.getAll(tripId!),
  });

  const members = data?.data ?? [];
  const trip = tripData?.data;
  const isOwner = trip?.createdById === user?.id;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const addMutation = useMutation({
    mutationFn: (data: FormData) => membersApi.add(tripId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      toast.success('Member added!');
      reset();
      setShowAddForm(false);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add member';
      toast.error(msg);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => membersApi.remove(tripId!, removeMember!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      toast.success('Member removed');
      setRemoveMember(null);
    },
  });

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-700">Members ({members.length})</h2>
          {isOwner && (
            <Button size="sm" onClick={() => setShowAddForm(true)}>+ Invite</Button>
          )}
        </div>

        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="flex flex-col gap-2">
            {members.map((member) => {
              const name = getMemberDisplayName(member);
              const email = member.user?.email ?? member.invitedEmail ?? '';
              const isCurrentUser = member.userId === user?.id;

              return (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-stone-800">
                          {name} {isCurrentUser && <span className="text-stone-400">(you)</span>}
                        </p>
                        <Badge variant={member.role === 'OWNER' ? 'earth' : 'gray'}>{member.role}</Badge>
                        {member.isPending && <Badge variant="yellow">Pending invite</Badge>}
                      </div>
                      <p className="text-xs text-stone-400 truncate">{email}</p>
                    </div>
                    {isOwner && member.role !== 'OWNER' && (
                      <button
                        onClick={() => setRemoveMember(member)}
                        className="p-1.5 rounded-lg text-stone-300 hover:bg-red-100 hover:text-red-500 transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Modal open={showAddForm} onClose={() => setShowAddForm(false)} title="Invite member">
          <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} className="flex flex-col gap-4">
            <p className="text-sm text-stone-500">
              If they already have an account, they'll be added immediately. Otherwise, they'll be stored as a pending invite.
            </p>
            <Input
              label="Name *"
              placeholder="Their full name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="their@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)} fullWidth>Cancel</Button>
              <Button type="submit" loading={addMutation.isPending} fullWidth>Add member</Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          open={!!removeMember}
          onClose={() => setRemoveMember(null)}
          onConfirm={() => removeMutation.mutate()}
          loading={removeMutation.isPending}
          title="Remove member"
          message={`Remove ${removeMember ? getMemberDisplayName(removeMember) : ''} from this trip?`}
          confirmLabel="Remove"
        />
      </div>
    </TripLayout>
  );
}
