import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { PackingCategory } from '../../../types';
import type { CreatePackingItemPayload } from '../services/packingApi';

interface PackingItemFormProps {
  defaultValues: Partial<CreatePackingItemPayload>;
  categories: PackingCategory[];
  onSubmit: (data: CreatePackingItemPayload) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
}

export function PackingItemForm({
  defaultValues,
  categories,
  onSubmit,
  isPending,
  onCancel,
  submitLabel,
}: PackingItemFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePackingItemPayload>({
    defaultValues: { requiredQuantity: 1, priority: 'MEDIUM', isSharedItem: true, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Item name *" placeholder="e.g. Camping chairs" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Quantity needed" type="number" min={1} {...register('requiredQuantity', { valueAsNumber: true })} />
        <Input label="Unit" placeholder="e.g. chairs" {...register('unit')} />
      </div>
      <Select label="Category" options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="No category" {...register('categoryId')} />
      <Select label="Priority" options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} {...register('priority')} />
      <Textarea label="Description (optional)" placeholder="Any details..." {...register('description')} />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isSharedItem" {...register('isSharedItem')} className="rounded" />
        <label htmlFor="isSharedItem" className="text-sm text-stone-600">Shared item (multiple people can claim)</label>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>Cancel</Button>
        <Button type="submit" loading={isPending} fullWidth>{submitLabel}</Button>
      </div>
    </form>
  );
}
