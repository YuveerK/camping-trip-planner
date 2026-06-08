import { useParams } from 'react-router-dom';
import { TripLayout } from '../../../components/layout/TripLayout';
import { PageLoader } from '../../../components/ui/LoadingSpinner';
import { useExpenseSummary } from '../../expenses/hooks/useExpenses';
import { useMeals } from '../../meals/hooks/useMeals';
import { usePackingItems } from '../../packing/hooks/usePacking';
import { useTasks } from '../../tasks/hooks/useTasks';
import { TripDashboardSections } from '../components/TripDashboardSections';
import { useTrip } from '../hooks/useTrips';

export function TripDashboardPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: tripData, isLoading } = useTrip(tripId);
  const { data: packingData } = usePackingItems(tripId);
  const { data: tasksData } = useTasks(tripId);
  const { data: mealsData } = useMeals(tripId);
  const { data: expensesData } = useExpenseSummary(tripId);

  if (isLoading) return <TripLayout><PageLoader /></TripLayout>;

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <TripDashboardSections
          tripId={tripId!}
          trip={tripData?.data}
          items={packingData?.data ?? []}
          tasks={tasksData?.data ?? []}
          meals={mealsData?.data ?? []}
          expenses={expensesData?.data}
        />
      </div>
    </TripLayout>
  );
}
