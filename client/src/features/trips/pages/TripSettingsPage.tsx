import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripLayout } from '../../../components/layout/TripLayout';
import { PageLoader } from '../../../components/ui/LoadingSpinner';
import { ConfirmModal } from '../../../components/ui/Modal';
import { useAuth } from '../../../hooks/useAuth';
import { TripDangerZone } from '../components/TripDangerZone';
import { TripSettingsForm } from '../components/TripSettingsForm';
import { useDeleteTrip, useTrip, useUpdateTrip } from '../hooks/useTrips';

export function TripSettingsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const [showDelete, setShowDelete] = useState(false);
  const { data, isLoading } = useTrip(tripId);
  const trip = data?.data;
  const isOwner = trip?.createdById === user?.id;
  const updateMutation = useUpdateTrip(tripId);
  const deleteMutation = useDeleteTrip(tripId);

  if (isLoading) return <TripLayout><PageLoader /></TripLayout>;

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Trip Settings</h2>
        <TripSettingsForm trip={trip} isOwner={!!isOwner} isPending={updateMutation.isPending} onSubmit={(payload) => updateMutation.mutate(payload)} />
        <TripDangerZone isOwner={!!isOwner} onDelete={() => setShowDelete(true)} />
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
