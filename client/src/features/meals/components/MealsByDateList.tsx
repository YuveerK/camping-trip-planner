import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import type { Meal } from '../../../types';
import { formatDate } from '../../../utils/date';
import { MealCard } from './MealCard';

interface MealsByDateListProps {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

export function MealsByDateList({ meals, onEdit, onDelete }: MealsByDateListProps) {
  const mealsByDate = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    const dateKey = meal.mealDate.slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey]!.push(meal);
    return acc;
  }, {});

  return (
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
                .sort((a, b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType))
                .map((meal) => (
                  <MealCard key={meal.id} meal={meal} onEdit={() => onEdit(meal)} onDelete={() => onDelete(meal)} />
                ))}
            </CardBody>
          </Card>
        ))}
    </div>
  );
}

const mealOrder = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
