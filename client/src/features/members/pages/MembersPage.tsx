import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripLayout } from '../../../components/layout/TripLayout';
import { Button } from '../../../components/ui/Button';
import { PageLoader } from '../../../components/ui/LoadingSpinner';
import { ConfirmModal } from '../../../components/ui/Modal';
import { useAuth } from '../../../hooks/useAuth';
import type { TripMember } from '../../../types';
import { getMemberDisplayName } from '../../../utils/format';
import { useTrip } from '../../trips/hooks/useTrips';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { MembersList } from '../components/MembersList';
import { useMembers, useRemoveMember } from '../hooks/useMembers';

export function MembersPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [removeMember, setRemoveMember] = useState<TripMember | null>(null);
  const { data: tripData } = useTrip(tripId);
  const { data, isLoading } = useMembers(tripId);
  const members = data?.data ?? [];
  const trip = tripData?.data;
  const isOwner = trip?.createdById === user?.id;

  const removeMutation = useRemoveMember(tripId, () => setRemoveMember(null));

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-700">Members ({members.length})</h2>
          {isOwner && <Button size="sm" onClick={() => setShowAddForm(true)}>+ Invite</Button>}
        </div>

        {isLoading ? <PageLoader /> : <MembersList members={members} currentUserId={user?.id} isOwner={!!isOwner} onRemove={setRemoveMember} />}

        <InviteMemberModal open={showAddForm} onClose={() => setShowAddForm(false)} tripId={tripId!} />
        <ConfirmModal
          open={!!removeMember}
          onClose={() => setRemoveMember(null)}
          onConfirm={() => removeMember && removeMutation.mutate(removeMember.id)}
          loading={removeMutation.isPending}
          title="Remove member"
          message={`Remove ${removeMember ? getMemberDisplayName(removeMember) : ''} from this trip?`}
          confirmLabel="Remove"
        />
      </div>
    </TripLayout>
  );
}
