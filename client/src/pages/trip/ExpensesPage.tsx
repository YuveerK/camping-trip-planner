import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { expensesApi, type CreateExpensePayload } from '../../api/expenses';
import { membersApi } from '../../api/members';
import { TripLayout } from '../../layouts/TripLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatCurrency, getMemberDisplayName } from '../../utils/format';
import type { Expense } from '../../types';
import { clsx } from 'clsx';

export function ExpensesPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [showForm, setShowForm] = useState(false);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => expensesApi.getAll(tripId!),
  });

  const { data: membersData } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => membersApi.getAll(tripId!),
    enabled: showForm,
  });

  const members = (membersData?.data ?? []).filter((m) => !m.isPending);
  const summary = data?.data;
  const expenses = summary?.expenses ?? [];

  const deleteMutation = useMutation({
    mutationFn: () => expensesApi.delete(tripId!, deleteExpense!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      toast.success('Expense removed');
      setDeleteExpense(null);
    },
  });

  const [unitPrice, setUnitPrice] = useState('');
  const [qty, setQty] = useState('');

  const { register, handleSubmit, reset, setValue } = useForm<CreateExpensePayload>({
    defaultValues: { splitType: 'EQUAL' },
  });

  function handleCalculatorChange(newUnitPrice: string, newQty: string) {
    const p = parseFloat(newUnitPrice);
    const q = parseFloat(newQty);
    if (!isNaN(p) && !isNaN(q) && p > 0 && q > 0) {
      setValue('amount', parseFloat((p * q).toFixed(2)));
    }
  }

  function resetForm() {
    reset();
    setUnitPrice('');
    setQty('');
  }

  const createMutation = useMutation({
    mutationFn: (data: CreateExpensePayload) => expensesApi.create(tripId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      toast.success('Expense added');
      resetForm();
      setShowForm(false);
    },
    onError: () => toast.error('Failed to add expense'),
  });

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-700">Expenses</h2>
          <Button size="sm" onClick={() => setShowForm(true)}>+ Add expense</Button>
        </div>

        {/* Summary */}
        {summary && (
          <Card className="mb-4 bg-gradient-to-r from-earth-50 to-forest-50">
            <CardBody>
              <div className="text-center mb-3">
                <p className="text-xs text-stone-500 uppercase tracking-wide">Total spend</p>
                <p className="text-3xl font-bold text-stone-800">{formatCurrency(summary.totalAmount)}</p>
              </div>
              {summary.perMemberBalance.length > 0 && (
                <div className="flex flex-col gap-2">
                  {summary.perMemberBalance.map((b) => (
                    <div key={b.memberId} className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">{b.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">paid {formatCurrency(b.paid)}</span>
                        <span
                          className={clsx(
                            'font-semibold text-xs px-2 py-0.5 rounded-full',
                            b.net > 0 ? 'bg-forest-100 text-forest-700' : b.net < 0 ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-500'
                          )}
                        >
                          {b.net > 0 ? `+${formatCurrency(b.net)}` : b.net < 0 ? formatCurrency(b.net) : 'Even'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {isLoading ? (
          <PageLoader />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon="💰"
            title="No expenses yet"
            description="Track who paid for what and split costs equally"
            action={<Button onClick={() => setShowForm(true)}>Add first expense</Button>}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {expenses.map((expense) => (
              <Card key={expense.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-earth-100 flex items-center justify-center text-earth-700 text-lg shrink-0">
                    💸
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-stone-800">{expense.title}</p>
                      <p className="text-sm font-bold text-earth-600 shrink-0">{formatCurrency(expense.amount)}</p>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Paid by {getMemberDisplayName(expense.paidBy)}
                    </p>
                    {expense.notes && <p className="text-xs text-stone-400 mt-0.5">{expense.notes}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="gray">{expense.splitType === 'EQUAL' ? 'Split equally' : 'Custom split'}</Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteExpense(expense)}
                    className="p-1.5 rounded-lg text-stone-300 hover:bg-red-100 hover:text-red-500 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Add expense">
          <form onSubmit={handleSubmit((d) => createMutation.mutate({ ...d, amount: Number(d.amount) }))} className="flex flex-col gap-4">
            <Input label="Description *" placeholder="e.g. Firewood" {...register('title', { required: true })} />

            {/* Quantity calculator */}
            <div>
              <p className="text-xs font-medium text-stone-500 mb-1.5">Quantity calculator <span className="font-normal text-stone-400">(optional)</span></p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Unit price"
                    value={unitPrice}
                    onChange={(e) => { setUnitPrice(e.target.value); handleCalculatorChange(e.target.value, qty); }}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  />
                </div>
                <span className="text-stone-400 font-medium text-sm shrink-0">×</span>
                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Qty"
                    value={qty}
                    onChange={(e) => { setQty(e.target.value); handleCalculatorChange(unitPrice, e.target.value); }}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  />
                </div>
                <span className="text-stone-400 font-medium text-sm shrink-0">= R</span>
                <div className="flex-1">
                  <Input
                    placeholder="Total"
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register('amount', { required: true })}
                  />
                </div>
              </div>
            </div>

            <Select
              label="Paid by *"
              options={members.map((m) => ({ value: m.id, label: getMemberDisplayName(m) }))}
              placeholder="Select member"
              {...register('paidByMemberId', { required: true })}
            />
            <Textarea label="Notes" placeholder="Optional details..." {...register('notes')} />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); resetForm(); }} fullWidth>Cancel</Button>
              <Button type="submit" loading={createMutation.isPending} fullWidth>Add expense</Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          open={!!deleteExpense}
          onClose={() => setDeleteExpense(null)}
          onConfirm={() => deleteMutation.mutate()}
          loading={deleteMutation.isPending}
          title="Remove expense"
          message={`Remove "${deleteExpense?.title}" (${formatCurrency(deleteExpense?.amount ?? 0)})?`}
        />
      </div>
    </TripLayout>
  );
}
