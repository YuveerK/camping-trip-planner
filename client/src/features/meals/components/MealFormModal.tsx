import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import type { ApiResponse, Meal as MealType } from '../../../types';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import type { Meal } from '../../../types';
import { getMemberDisplayName } from '../../../utils/format';
import { useMembers } from '../../members/hooks/useMembers';
import { mealsKeys } from '../hooks/useMeals';
import { mealsApi, type CreateMealPayload } from '../services/mealsApi';
import { toMealFormValues } from '../utils/mealForm';

interface MealFormModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  editMeal: Meal | null;
}

export function MealFormModal({ open, onClose, tripId, editMeal }: MealFormModalProps) {
  const queryClient = useQueryClient();
  const { data: membersData } = useMembers(tripId, open);
  const members = membersData?.data ?? [];
  const { register, handleSubmit, reset } = useForm<CreateMealPayload>({
    defaultValues: editMeal ? toMealFormValues(editMeal) : { mealType: 'DINNER' },
  });

  const saveMutation = useMutation({
    mutationFn: (data: CreateMealPayload) => {
      const payload = {
        ...data,
        mealDate: new Date(data.mealDate).toISOString(),
        assignedToMemberId: data.assignedToMemberId || null,
      };
      return editMeal ? mealsApi.update(tripId, editMeal.id, payload) : mealsApi.create(tripId, payload);
    },
    onSuccess: (data) => {
      const key = mealsKeys.list(tripId);
      queryClient.setQueryData<ApiResponse<MealType[]>>(key, (old) => {
        if (!old) return old;
        return editMeal
          ? { ...old, data: old.data.map((m) => m.id === editMeal.id ? data.data : m) }
          : { ...old, data: [...old.data, data.data] };
      });
      queryClient.invalidateQueries({ queryKey: key });
      toast.success(editMeal ? 'Meal updated' : 'Meal added');
      reset();
      onClose();
    },
    onError: () => toast.error('Failed to save meal'),
  });

  return (
    <Modal open={open} onClose={onClose} title={editMeal ? 'Edit meal' : 'Add meal'}>
      <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="flex flex-col gap-4">
        <Input label="Meal name *" placeholder="e.g. Saturday Braai" {...register('title', { required: true })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date *" type="date" {...register('mealDate', { required: true })} />
          <Select
            label="Meal type"
            options={[
              { value: 'BREAKFAST', label: 'Breakfast' },
              { value: 'LUNCH', label: 'Lunch' },
              { value: 'DINNER', label: 'Dinner' },
              { value: 'SNACK', label: 'Snack' },
            ]}
            {...register('mealType')}
          />
        </div>
        <Select label="Who's cooking?" options={members.map((member) => ({ value: member.id, label: getMemberDisplayName(member) }))} placeholder="Unassigned" {...register('assignedToMemberId')} />
        <Textarea label="Details" placeholder="Menu, ingredients needed..." {...register('description')} />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
          <Button type="submit" loading={saveMutation.isPending} fullWidth>{editMeal ? 'Save' : 'Add'}</Button>
        </div>
      </form>
    </Modal>
  );
}
