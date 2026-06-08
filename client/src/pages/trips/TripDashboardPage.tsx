import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { tripsApi } from '../../api/trips';
import { packingApi } from '../../api/packing';
import { tasksApi } from '../../api/tasks';
import { mealsApi } from '../../api/meals';
import { expensesApi } from '../../api/expenses';
import { TripLayout } from '../../layouts/TripLayout';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatDateRange, formatDate } from '../../utils/date';
import { formatCurrency, getTotalClaimed } from '../../utils/format';

export function TripDashboardPage() {
  const { tripId } = useParams<{ tripId: string }>();

  const { data: tripData, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getOne(tripId!),
  });

  const { data: packingData } = useQuery({
    queryKey: ['packing', tripId],
    queryFn: () => packingApi.getAll(tripId!),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', tripId],
    queryFn: () => tasksApi.getAll(tripId!),
  });

  const { data: mealsData } = useQuery({
    queryKey: ['meals', tripId],
    queryFn: () => mealsApi.getAll(tripId!),
  });

  const { data: expensesData } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => expensesApi.getAll(tripId!),
  });

  if (isLoading) return <TripLayout><PageLoader /></TripLayout>;

  const trip = tripData?.data;
  const items = packingData?.data ?? [];
  const tasks = tasksData?.data ?? [];
  const meals = mealsData?.data ?? [];
  const expSummary = expensesData?.data;

  const missingCount = items.filter((i) => getTotalClaimed(i.claims) < i.requiredQuantity).length;
  const packedCount = items.filter((i) => i.claims.every((c) => c.isPacked) && i.claims.length > 0).length;
  const pendingTasks = tasks.filter((t) => t.status !== 'DONE').length;
  const members = trip?.members ?? [];

  return (
    <TripLayout>
      <div className="page-container pt-4">
        {/* Trip header */}
        {trip && (
          <Card className="mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-forest-700 to-forest-600 p-4 text-white">
              <h2 className="font-bold text-lg">{trip.name}</h2>
              {trip.campsiteName && <p className="text-forest-100 text-sm">⛺ {trip.campsiteName}</p>}
              {trip.location && <p className="text-forest-200 text-xs">📍 {trip.location}</p>}
            </div>
            <CardBody className="py-3">
              <div className="flex items-center gap-4 flex-wrap text-sm text-stone-600">
                <span>📅 {formatDateRange(trip.checkInDate, trip.checkOutDate)}</span>
                {trip.bookingReference && (
                  <span>🔖 {trip.bookingReference}</span>
                )}
              </div>
              {trip.description && (
                <p className="text-sm text-stone-500 mt-2 line-clamp-2">{trip.description}</p>
              )}
            </CardBody>
          </Card>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link to={`/trips/${tripId}/packing`}>
            <StatCard label="Packing items" value={items.length} icon="🎒" color="green" />
          </Link>
          <Link to={`/trips/${tripId}/packing?tab=missing`}>
            <StatCard label="Missing items" value={missingCount} icon="⚠️" color={missingCount > 0 ? 'red' : 'green'} />
          </Link>
          <Link to={`/trips/${tripId}/packing?tab=my-items`}>
            <StatCard label="Items packed" value={packedCount} icon="✅" color="earth" />
          </Link>
          <Link to={`/trips/${tripId}/tasks`}>
            <StatCard label="Tasks left" value={pendingTasks} icon="📋" color={pendingTasks > 0 ? 'earth' : 'green'} />
          </Link>
          <Link to={`/trips/${tripId}/meals`}>
            <StatCard label="Meals planned" value={meals.length} icon="🍖" color="blue" />
          </Link>
          <Link to={`/trips/${tripId}/expenses`}>
            <StatCard
              label="Total expenses"
              value={expSummary ? formatCurrency(expSummary.totalAmount) : 'R 0.00'}
              icon="💰"
              color="earth"
            />
          </Link>
        </div>

        {/* Members */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-700">👥 Members ({members.length})</h3>
              <Link to={`/trips/${tripId}/members`} className="text-xs text-forest-600 font-medium">
                Manage →
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 text-sm font-semibold">
                      {(m.user?.name ?? m.invitedName ?? '?')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-700">
                        {m.user?.name ?? m.invitedName ?? m.invitedEmail}
                      </p>
                      <p className="text-xs text-stone-400">{m.user?.email ?? m.invitedEmail}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={m.role === 'OWNER' ? 'earth' : 'gray'}>{m.role}</Badge>
                    {m.isPending && <Badge variant="yellow">Pending</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={`/trips/${tripId}/packing`}>
            <Card className="p-3 text-center hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="text-2xl mb-1">🎒</div>
              <p className="text-xs font-medium text-stone-600">Packing List</p>
            </Card>
          </Link>
          <Link to={`/trips/${tripId}/tasks`}>
            <Card className="p-3 text-center hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="text-2xl mb-1">✅</div>
              <p className="text-xs font-medium text-stone-600">Tasks</p>
            </Card>
          </Link>
          <Link to={`/trips/${tripId}/meals`}>
            <Card className="p-3 text-center hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="text-2xl mb-1">🍖</div>
              <p className="text-xs font-medium text-stone-600">Meal Plan</p>
            </Card>
          </Link>
          <Link to={`/trips/${tripId}/expenses`}>
            <Card className="p-3 text-center hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="text-2xl mb-1">💰</div>
              <p className="text-xs font-medium text-stone-600">Expenses</p>
            </Card>
          </Link>
        </div>

        {/* Settings link */}
        <div className="mt-4 text-center">
          <Link
            to={`/trips/${tripId}/settings`}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            ⚙️ Trip settings
          </Link>
        </div>
      </div>
    </TripLayout>
  );
}
