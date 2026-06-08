import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { mealsApi, type CreateMealPayload } from '../../api/meals';
import { membersApi } from '../../api/members';
import { TripLayout } from '../../layouts/TripLayout';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/date';
import { getMemberDisplayName } from '../../utils/format';
import type { Meal } from '../../types';

const MEAL_ICONS = { BREAKFAST: '🌅', LUNCH: '☀️', DINNER: '🌙', SNACK: '🍎' };
const MEAL_COLORS = { BREAKFAST: 'earth', LUNCH: 'blue', DINNER: 'green', SNACK: 'gray' } as const;

function toMealFormValues(meal: Meal): CreateMealPayload {
  return {
    title: meal.title,
    description: meal.description ?? '',
    mealDate: meal.mealDate.slice(0, 10),
    mealType: meal.mealType,
    assignedToMemberId: meal.assignedToMemberId ?? '',
  };
}

function MealCard({ meal, onEdit, onDelete }: { meal: Meal; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <span className="text-xl">{MEAL_ICONS[meal.mealType]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-stone-800">{meal.title}</p>
          <Badge variant={MEAL_COLORS[meal.mealType]}>{meal.mealType}</Badge>
        </div>
        {meal.description && <p className="text-xs text-stone-500 mt-0.5">{meal.description}</p>}
        {meal.assignedTo && (
          <p className="text-xs text-stone-400 mt-1">👤 {getMemberDisplayName(meal.assignedTo)}</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-red-100 hover:text-red-500 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function MealsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [showForm, setShowForm] = useState(false);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const [deleteMeal, setDeleteMeal] = useState<Meal | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['meals', tripId],
    queryFn: () => mealsApi.getAll(tripId!),
  });

  const { data: membersData } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => membersApi.getAll(tripId!),
    enabled: showForm,
  });

  const members = membersData?.data ?? [];
  const meals = data?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: () => mealsApi.delete(tripId!, deleteMeal!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', tripId] });
      toast.success('Meal removed');
      setDeleteMeal(null);
    },
  });

  // Group meals by date
  const mealsByDate = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    const dateKey = meal.mealDate.slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey]!.push(meal);
    return acc;
  }, {});

  const { register, handleSubmit, reset } = useForm<CreateMealPayload>({
    defaultValues: editMeal
      ? toMealFormValues(editMeal)
      : { mealType: 'DINNER' },
  });

  const saveMutation = useMutation({
    mutationFn: (data: CreateMealPayload) => {
      const payload = {
        ...data,
        mealDate: new Date(data.mealDate).toISOString(),
        assignedToMemberId: data.assignedToMemberId || null,
      };
      return editMeal
        ? mealsApi.update(tripId!, editMeal.id, payload)
        : mealsApi.create(tripId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', tripId] });
      toast.success(editMeal ? 'Meal updated' : 'Meal added');
      reset();
      setShowForm(false);
      setEditMeal(null);
    },
    onError: () => toast.error('Failed to save meal'),
  });

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-700">Meal Plan ({meals.length})</h2>
          <Button size="sm" onClick={() => { setEditMeal(null); reset({ mealType: 'DINNER' }); setShowForm(true); }}>
            + Add meal
          </Button>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : meals.length === 0 ? (
          <EmptyState
            icon="🍖"
            title="No meals planned yet"
            description="Plan who's cooking what and when"
            action={<Button onClick={() => setShowForm(true)}>Plan first meal</Button>}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(mealsByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, dayMeals]) => (
                <Card key={date}>
                  <CardHeader>
                    <h3 className="text-sm font-semibold text-stone-700">{formatDate(date, 'EEEE, d MMM')}</h3>
                  </CardHeader>
                  <CardBody className="py-0">
                    {dayMeals
                      .sort((a, b) => {
                        const order = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
                        return order.indexOf(a.mealType) - order.indexOf(b.mealType);
                      })
                      .map((meal) => (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          onEdit={() => {
                            setEditMeal(meal);
                            reset(toMealFormValues(meal));
                            setShowForm(true);
                          }}
                          onDelete={() => setDeleteMeal(meal)}
                        />
                      ))}
                  </CardBody>
                </Card>
              ))}
          </div>
        )}

        <Modal open={showForm} onClose={() => { setShowForm(false); setEditMeal(null); }} title={editMeal ? 'Edit meal' : 'Add meal'}>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="flex flex-col gap-4">
            <Input label="Meal name *" placeholder="e.g. Saturday Braai" {...register('title', { required: true })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date *" type="date" {...register('mealDate', { required: true })} />
              <Select
                label="Meal type"
                options={[
                  { value: 'BREAKFAST', label: '🌅 Breakfast' },
                  { value: 'LUNCH', label: '☀️ Lunch' },
                  { value: 'DINNER', label: '🌙 Dinner' },
                  { value: 'SNACK', label: '🍎 Snack' },
                ]}
                {...register('mealType')}
              />
            </div>
            <Select
              label="Who's cooking?"
              options={members.map((m) => ({ value: m.id, label: getMemberDisplayName(m) }))}
              placeholder="Unassigned"
              {...register('assignedToMemberId')}
            />
            <Textarea label="Details" placeholder="Menu, ingredients needed..." {...register('description')} />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditMeal(null); }} fullWidth>Cancel</Button>
              <Button type="submit" loading={saveMutation.isPending} fullWidth>{editMeal ? 'Save' : 'Add'}</Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          open={!!deleteMeal}
          onClose={() => setDeleteMeal(null)}
          onConfirm={() => deleteMutation.mutate()}
          loading={deleteMutation.isPending}
          title="Remove meal"
          message={`Remove "${deleteMeal?.title}" from the meal plan?`}
        />
      </div>
    </TripLayout>
  );
}
