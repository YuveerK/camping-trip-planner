import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import type { TripMember } from '../../../types';
import { getMemberDisplayName } from '../../../utils/format';
import type { CreateExpensePayload } from '../services/expensesApi';

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  members: TripMember[];
  isPending: boolean;
  onSubmit: (data: CreateExpensePayload) => void;
}

export function ExpenseFormModal({ open, onClose, members, isPending, onSubmit }: ExpenseFormModalProps) {
  const [unitPrice, setUnitPrice] = useState('');
  const [qty, setQty] = useState('');
  const { register, handleSubmit, reset, setValue } = useForm<CreateExpensePayload>({
    defaultValues: { splitType: 'EQUAL' },
  });

  function handleCalculatorChange(newUnitPrice: string, newQty: string) {
    const price = parseFloat(newUnitPrice);
    const quantity = parseFloat(newQty);
    if (!isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0) {
      setValue('amount', parseFloat((price * quantity).toFixed(2)));
    }
  }

  function closeAndReset() {
    reset();
    setUnitPrice('');
    setQty('');
    onClose();
  }

  return (
    <Modal open={open} onClose={closeAndReset} title="Add expense">
      <form onSubmit={handleSubmit((data) => onSubmit({ ...data, amount: Number(data.amount) }))} className="flex flex-col gap-4">
        <Input label="Description *" placeholder="e.g. Firewood" {...register('title', { required: true })} />
        <div>
          <p className="text-xs font-medium text-stone-500 mb-1.5">Quantity calculator <span className="font-normal text-stone-400">(optional)</span></p>
          <div className="flex items-center gap-2">
            <input type="number" min="0.01" step="0.01" placeholder="Unit price" value={unitPrice} onChange={(event) => { setUnitPrice(event.target.value); handleCalculatorChange(event.target.value, qty); }} className="min-w-0 flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            <span className="text-stone-400 font-medium text-sm shrink-0">x</span>
            <input type="number" min="1" step="1" placeholder="Qty" value={qty} onChange={(event) => { setQty(event.target.value); handleCalculatorChange(unitPrice, event.target.value); }} className="w-20 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" />
            <span className="text-stone-400 font-medium text-sm shrink-0">= R</span>
            <Input placeholder="Total" type="number" step="0.01" min="0.01" {...register('amount', { required: true })} />
          </div>
        </div>
        <Select label="Paid by *" options={members.map((member) => ({ value: member.id, label: getMemberDisplayName(member) }))} placeholder="Select member" {...register('paidByMemberId', { required: true })} />
        <Textarea label="Notes" placeholder="Optional details..." {...register('notes')} />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={closeAndReset} fullWidth>Cancel</Button>
          <Button type="submit" loading={isPending} fullWidth>Add expense</Button>
        </div>
      </form>
    </Modal>
  );
}
