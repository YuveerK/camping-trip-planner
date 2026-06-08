import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import type { ExpenseSummary, Meal, PackingItem, Task, Trip } from '../../../types';
import { formatDateRange } from '../../../utils/date';
import { formatCurrency, getTotalClaimed } from '../../../utils/format';

interface TripDashboardSectionsProps {
  tripId: string;
  trip?: Trip;
  items: PackingItem[];
  tasks: Task[];
  meals: Meal[];
  expenses?: ExpenseSummary;
}

export function TripDashboardSections({ tripId, trip, items, tasks, meals, expenses }: TripDashboardSectionsProps) {
  const missingCount = items.filter((item) => getTotalClaimed(item.claims) < item.requiredQuantity).length;
  const packedCount = items.filter((item) => item.claims.every((claim) => claim.isPacked) && item.claims.length > 0).length;
  const pendingTasks = tasks.filter((task) => task.status !== 'DONE').length;
  const members = trip?.members ?? [];

  return (
    <>
      {trip && <TripSummaryCard trip={trip} />}
      <DashboardStats tripId={tripId} itemsCount={items.length} missingCount={missingCount} packedCount={packedCount} pendingTasks={pendingTasks} mealsCount={meals.length} expenses={expenses} />
      <DashboardMembers tripId={tripId} members={members} />
      <QuickActions tripId={tripId} />
    </>
  );
}

function TripSummaryCard({ trip }: { trip: Trip }) {
  return (
    <Card className="mb-4 overflow-hidden">
      <div className="bg-gradient-to-r from-forest-700 to-forest-600 p-4 text-white">
        <h2 className="font-bold text-lg">{trip.name}</h2>
        {trip.campsiteName && <p className="text-forest-100 text-sm">{trip.campsiteName}</p>}
        {trip.location && <p className="text-forest-200 text-xs">{trip.location}</p>}
      </div>
      <CardBody className="py-3">
        <div className="flex items-center gap-4 flex-wrap text-sm text-stone-600">
          <span>{formatDateRange(trip.checkInDate, trip.checkOutDate)}</span>
          {trip.bookingReference && <span>{trip.bookingReference}</span>}
        </div>
        {trip.description && <p className="text-sm text-stone-500 mt-2 line-clamp-2">{trip.description}</p>}
      </CardBody>
    </Card>
  );
}

function DashboardStats({ tripId, itemsCount, missingCount, packedCount, pendingTasks, mealsCount, expenses }: {
  tripId: string;
  itemsCount: number;
  missingCount: number;
  packedCount: number;
  pendingTasks: number;
  mealsCount: number;
  expenses?: ExpenseSummary;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <Link to={`/trips/${tripId}/packing`}><StatCard label="Packing items" value={itemsCount} icon="Bag" color="green" /></Link>
      <Link to={`/trips/${tripId}/packing?tab=missing`}><StatCard label="Missing items" value={missingCount} icon="Missing" color={missingCount > 0 ? 'red' : 'green'} /></Link>
      <Link to={`/trips/${tripId}/packing?tab=my-items`}><StatCard label="Items packed" value={packedCount} icon="Packed" color="earth" /></Link>
      <Link to={`/trips/${tripId}/tasks`}><StatCard label="Tasks left" value={pendingTasks} icon="Tasks" color={pendingTasks > 0 ? 'earth' : 'green'} /></Link>
      <Link to={`/trips/${tripId}/meals`}><StatCard label="Meals planned" value={mealsCount} icon="Meals" color="blue" /></Link>
      <Link to={`/trips/${tripId}/expenses`}><StatCard label="Total expenses" value={expenses ? formatCurrency(expenses.totalAmount) : 'R 0.00'} icon="Money" color="earth" /></Link>
    </div>
  );
}

function DashboardMembers({ tripId, members }: { tripId: string; members: Trip['members'] }) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-700">Members ({members.length})</h3>
          <Link to={`/trips/${tripId}/members`} className="text-xs text-forest-600 font-medium">Manage</Link>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 text-sm font-semibold">
                  {(member.user?.name ?? member.invitedName ?? '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-700">{member.user?.name ?? member.invitedName ?? member.invitedEmail}</p>
                  <p className="text-xs text-stone-400">{member.user?.email ?? member.invitedEmail}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Badge variant={member.role === 'OWNER' ? 'earth' : 'gray'}>{member.role}</Badge>
                {member.isPending && <Badge variant="yellow">Pending</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function QuickActions({ tripId }: { tripId: string }) {
  const actions = [
    { to: 'packing', label: 'Packing List' },
    { to: 'tasks', label: 'Tasks' },
    { to: 'meals', label: 'Meal Plan' },
    { to: 'expenses', label: 'Expenses' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link key={action.to} to={`/trips/${tripId}/${action.to}`}>
            <Card className="p-3 text-center hover:shadow-card-hover transition-shadow cursor-pointer">
              <p className="text-sm font-medium text-stone-700">{action.label}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link to={`/trips/${tripId}/settings`} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Trip settings</Link>
      </div>
    </>
  );
}
