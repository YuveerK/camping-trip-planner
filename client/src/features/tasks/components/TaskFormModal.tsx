import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import type { ApiResponse, Task as TaskType } from '../../../types';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import type { Task } from '../../../types';
import { getMemberDisplayName } from '../../../utils/format';
import { useMembers } from '../../members/hooks/useMembers';
import { tasksKeys } from '../hooks/useTasks';
import { tasksApi, type CreateTaskPayload } from '../services/tasksApi';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  editTask?: Task | null;
}

export function TaskFormModal({ open, onClose, tripId, editTask }: TaskFormModalProps) {
  const queryClient = useQueryClient();
  const { data: membersData } = useMembers(tripId, open);
  const members = membersData?.data ?? [];

  const { register, handleSubmit, reset } = useForm<CreateTaskPayload>({
    defaultValues: editTask
      ? {
          title: editTask.title,
          description: editTask.description ?? '',
          assignedToMemberId: editTask.assignedToMemberId ?? '',
          dueDate: editTask.dueDate ? editTask.dueDate.slice(0, 10) : '',
          status: editTask.status,
        }
      : { status: 'TODO' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateTaskPayload) => {
      const payload = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        assignedToMemberId: data.assignedToMemberId || null,
      };
      return editTask ? tasksApi.update(tripId, editTask.id, payload) : tasksApi.create(tripId, payload);
    },
    onSuccess: (data) => {
      const key = tasksKeys.list(tripId);
      queryClient.setQueryData<ApiResponse<TaskType[]>>(key, (old) => {
        if (!old) return old;
        return editTask
          ? { ...old, data: old.data.map((t) => t.id === editTask.id ? data.data : t) }
          : { ...old, data: [...old.data, data.data] };
      });
      queryClient.invalidateQueries({ queryKey: key });
      toast.success(editTask ? 'Task updated' : 'Task created');
      reset();
      onClose();
    },
    onError: () => toast.error('Failed to save task'),
  });

  return (
    <Modal open={open} onClose={onClose} title={editTask ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4">
        <Input label="Title *" placeholder="e.g. Confirm booking" {...register('title', { required: true })} />
        <Textarea label="Description" placeholder="Optional details..." {...register('description')} />
        <Select label="Assign to" options={members.map((member) => ({ value: member.id, label: getMemberDisplayName(member) }))} placeholder="Unassigned" {...register('assignedToMemberId')} />
        <Input label="Due date" type="date" {...register('dueDate')} />
        {editTask && (
          <Select
            label="Status"
            options={[
              { value: 'TODO', label: 'To do' },
              { value: 'IN_PROGRESS', label: 'In progress' },
              { value: 'DONE', label: 'Done' },
            ]}
            {...register('status')}
          />
        )}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
          <Button type="submit" loading={isPending} fullWidth>{editTask ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
