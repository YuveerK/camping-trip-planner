import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripLayout } from '../../../components/layout/TripLayout';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageLoader } from '../../../components/ui/LoadingSpinner';
import { ConfirmModal } from '../../../components/ui/Modal';
import type { Meal } from '../../../types';
import { MealFormModal } from '../components/MealFormModal';
import { MealsByDateList } from '../components/MealsByDateList';
import { useDeleteMeal, useMeals } from '../hooks/useMeals';

export function MealsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [showForm, setShowForm] = useState(false);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const [deleteMeal, setDeleteMeal] = useState<Meal | null>(null);
  const { data, isLoading } = useMeals(tripId);
  const meals = data?.data ?? [];
  const deleteMutation = useDeleteMeal(tripId, () => setDeleteMeal(null));

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-700">Meal Plan ({meals.length})</h2>
          <Button size="sm" onClick={() => { setEditMeal(null); setShowForm(true); }}>+ Add meal</Button>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : meals.length === 0 ? (
          <EmptyState icon="Meals" title="No meals planned yet" description="Plan who's cooking what and when" action={<Button onClick={() => setShowForm(true)}>Plan first meal</Button>} />
        ) : (
          <MealsByDateList
            meals={meals}
            onEdit={(meal) => { setEditMeal(meal); setShowForm(true); }}
            onDelete={setDeleteMeal}
          />
        )}

        <MealFormModal key={editMeal?.id ?? 'new'} open={showForm} onClose={() => { setShowForm(false); setEditMeal(null); }} tripId={tripId!} editMeal={editMeal} />
        <ConfirmModal open={!!deleteMeal} onClose={() => setDeleteMeal(null)} onConfirm={() => deleteMeal && deleteMutation.mutate(deleteMeal.id)} loading={deleteMutation.isPending} title="Remove meal" message={`Remove "${deleteMeal?.title}" from the meal plan?`} />
      </div>
    </TripLayout>
  );
}
