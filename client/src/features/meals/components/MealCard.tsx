import { Badge } from '../../../components/ui/Badge';
import type { Meal } from '../../../types';
import { getMemberDisplayName } from '../../../utils/format';

const MEAL_LABELS = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack' };
const MEAL_COLORS = { BREAKFAST: 'earth', LUNCH: 'blue', DINNER: 'green', SNACK: 'gray' } as const;

interface MealCardProps {
  meal: Meal;
  onEdit: () => void;
  onDelete: () => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <span className="text-xl">{MEAL_LABELS[meal.mealType][0]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-stone-800">{meal.title}</p>
          <Badge variant={MEAL_COLORS[meal.mealType]}>{MEAL_LABELS[meal.mealType]}</Badge>
        </div>
        {meal.description && <p className="text-xs text-stone-500 mt-0.5">{meal.description}</p>}
        {meal.assignedTo && <p className="text-xs text-stone-400 mt-1">Cook: {getMemberDisplayName(meal.assignedTo)}</p>}
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
