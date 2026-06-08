import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripLayout } from '../../../components/layout/TripLayout';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageLoader } from '../../../components/ui/LoadingSpinner';
import { ConfirmModal } from '../../../components/ui/Modal';
import type { Expense } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import { useMembers } from '../../members/hooks/useMembers';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { ExpenseList } from '../components/ExpenseList';
import { ExpenseSummaryCard } from '../components/ExpenseSummaryCard';
import { useCreateExpense, useDeleteExpense, useExpenseSummary } from '../hooks/useExpenses';

export function ExpensesPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [showForm, setShowForm] = useState(false);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const { data, isLoading } = useExpenseSummary(tripId);
  const { data: membersData } = useMembers(tripId, showForm);

  const members = (membersData?.data ?? []).filter((member) => !member.isPending);
  const summary = data?.data;
  const expenses = summary?.expenses ?? [];

  const deleteMutation = useDeleteExpense(tripId, () => setDeleteExpense(null));
  const createMutation = useCreateExpense(tripId, () => setShowForm(false));

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-700">Expenses</h2>
          <Button size="sm" onClick={() => setShowForm(true)}>+ Add expense</Button>
        </div>

        <ExpenseSummaryCard summary={summary} />
        {isLoading ? (
          <PageLoader />
        ) : expenses.length === 0 ? (
          <EmptyState icon="Expenses" title="No expenses yet" description="Track who paid for what and split costs equally" action={<Button onClick={() => setShowForm(true)}>Add first expense</Button>} />
        ) : (
          <ExpenseList expenses={expenses} onDelete={setDeleteExpense} />
        )}

        <ExpenseFormModal open={showForm} onClose={() => setShowForm(false)} members={members} isPending={createMutation.isPending} onSubmit={(payload) => createMutation.mutate(payload)} />
        <ConfirmModal open={!!deleteExpense} onClose={() => setDeleteExpense(null)} onConfirm={() => deleteExpense && deleteMutation.mutate(deleteExpense.id)} loading={deleteMutation.isPending} title="Remove expense" message={`Remove "${deleteExpense?.title}" (${formatCurrency(deleteExpense?.amount ?? 0)})?`} />
      </div>
    </TripLayout>
  );
}
