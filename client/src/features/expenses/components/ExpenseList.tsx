import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import type { Expense } from '../../../types';
import { formatCurrency, getMemberDisplayName } from '../../../utils/format';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <div className="flex flex-col gap-2">
      {expenses.map((expense) => (
        <Card key={expense.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-earth-100 flex items-center justify-center text-earth-700 text-lg shrink-0">R</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-800">{expense.title}</p>
                <p className="text-sm font-bold text-earth-600 shrink-0">{formatCurrency(expense.amount)}</p>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">Paid by {getMemberDisplayName(expense.paidBy)}</p>
              {expense.notes && <p className="text-xs text-stone-400 mt-0.5">{expense.notes}</p>}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="gray">{expense.splitType === 'EQUAL' ? 'Split equally' : 'Custom split'}</Badge>
              </div>
            </div>
            <button onClick={() => onDelete(expense)} className="p-1.5 rounded-lg text-stone-300 hover:bg-red-100 hover:text-red-500 transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
