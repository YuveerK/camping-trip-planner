import { Link } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageLoader } from '../../../components/ui/LoadingSpinner';
import { useAuth } from '../../../hooks/useAuth';
import { TripsList } from '../components/TripsList';
import { useTrips } from '../hooks/useTrips';

export function TripsListPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useTrips();
  const trips = data?.data ?? [];

  return (
    <MainLayout>
      <div className="page-container pt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-stone-800">My Trips</h1>
            <p className="text-sm text-stone-500">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <Link to="/trips/new"><Button size="sm"><span>+</span> New trip</Button></Link>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : error ? (
          <Card className="p-6 text-center"><p className="text-stone-500 text-sm">Failed to load trips. Please refresh.</p></Card>
        ) : trips.length === 0 ? (
          <EmptyState icon="Trips" title="No trips yet" description="Create your first camping trip and invite your friends" action={<Link to="/trips/new"><Button>Plan your first trip</Button></Link>} />
        ) : (
          <TripsList trips={trips} userId={user!.id} />
        )}
      </div>
    </MainLayout>
  );
}
