import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { tripsApi } from '../../api/trips';
import { MainLayout } from '../../layouts/MainLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateRange } from '../../utils/date';
import { useAuth } from '../../hooks/useAuth';
import type { Trip } from '../../types';

function TripCard({ trip, userId }: { trip: Trip; userId: string }) {
  const isOwner = trip.createdById === userId;
  const memberCount = trip.members.length;

  return (
    <Link to={`/trips/${trip.id}`}>
      <Card hover className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-stone-800 text-base">{trip.name}</h3>
              {isOwner && <Badge variant="green">Owner</Badge>}
            </div>
            {trip.campsiteName && (
              <p className="text-sm text-stone-500 mt-0.5 truncate">⛺ {trip.campsiteName}</p>
            )}
            {trip.location && (
              <p className="text-xs text-stone-400 truncate">📍 {trip.location}</p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-stone-500">
                📅 {formatDateRange(trip.checkInDate, trip.checkOutDate)}
              </span>
              <span className="text-xs text-stone-500">👥 {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
              {trip._count && (
                <span className="text-xs text-stone-500">🎒 {trip._count.packingItems} items</span>
              )}
            </div>
          </div>
          <svg className="w-5 h-5 text-stone-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}

export function TripsListPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: tripsApi.getAll,
  });

  const trips = data?.data ?? [];

  return (
    <MainLayout>
      <div className="page-container pt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-stone-800">My Trips</h1>
            <p className="text-sm text-stone-500">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
          </div>
          <Link to="/trips/new">
            <Button size="sm">
              <span>+</span> New trip
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-stone-500 text-sm">Failed to load trips. Please refresh.</p>
          </Card>
        ) : trips.length === 0 ? (
          <EmptyState
            icon="🏕️"
            title="No trips yet"
            description="Create your first camping trip and invite your friends"
            action={
              <Link to="/trips/new">
                <Button>Plan your first trip</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} userId={user!.id} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
