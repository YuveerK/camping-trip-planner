import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { tasksApi, type CreateTaskPayload } from '../../api/tasks';
import { membersApi } from '../../api/members';
import { TripLayout } from '../../layouts/TripLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/date';
import { getMemberDisplayName } from '../../utils/format';
import type { Task } from '../../types';
import { clsx } from 'clsx';

const STATUS_COLORS = {
  TODO: 'gray',
  IN_PROGRESS: 'earth',
  DONE: 'green',
} as const;

const STATUS_LABELS = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

function TaskCard({
  task,
  tripId,
  onEdit,
  onDelete,
}: {
  task: Task;
  tripId: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (status: Task['status']) => tasksApi.update(tripId, task.id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', tripId] }),
  });

  const nextStatus: Record<Task['status'], Task['status']> = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE: 'TODO',
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <button
          onClick={() => statusMutation.mutate(nextStatus[task.status])}
          className={clsx(
            'w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors',
            task.status === 'DONE'
              ? 'bg-forest-500 border-forest-500 text-white'
              : task.status === 'IN_PROGRESS'
              ? 'border-earth-400 bg-earth-50'
              : 'border-stone-300 bg-white'
          )}
        >
          {task.status === 'DONE' && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-medium', task.status === 'DONE' ? 'line-through text-stone-400' : 'text-stone-800')}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
            {task.assignedTo && (
              <span className="text-xs text-stone-500">
                👤 {getMemberDisplayName(task.assignedTo)}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs text-stone-500">📅 {formatDate(task.dueDate)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => onDelete(task)} className="p-1.5 rounded-lg text-stone-400 hover:bg-red-100 hover:text-red-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

function TaskFormModal({
  open, onClose, tripId, editTask
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  editTask?: Task | null;
}) {
  const queryClient = useQueryClient();
  const { data: membersData } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => membersApi.getAll(tripId),
    enabled: open,
  });

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
      return editTask
        ? tasksApi.update(tripId, editTask.id, payload)
        : tasksApi.create(tripId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', tripId] });
      toast.success(editTask ? 'Task updated' : 'Task created');
      reset();
      onClose();
    },
    onError: () => toast.error('Failed to save task'),
  });

  return (
    <Modal open={open} onClose={onClose} title={editTask ? 'Edit task' : 'New task'}>
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <Input label="Title *" placeholder="e.g. Confirm booking" {...register('title', { required: true })} />
        <Textarea label="Description" placeholder="Optional details..." {...register('description')} />
        <Select
          label="Assign to"
          options={members.map((m) => ({ value: m.id, label: getMemberDisplayName(m) }))}
          placeholder="Unassigned"
          {...register('assignedToMemberId')}
        />
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

export function TasksPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', tripId],
    queryFn: () => tasksApi.getAll(tripId!),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(tripId!, deleteTask!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', tripId] });
      toast.success('Task deleted');
      setDeleteTask(null);
    },
  });

  const tasks = data?.data ?? [];
  const grouped = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  return (
    <TripLayout>
      <div className="page-container pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-700">Tasks ({tasks.length})</h2>
          <Button size="sm" onClick={() => { setEditTask(null); setShowForm(true); }}>+ Add task</Button>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No tasks yet"
            description="Add tasks to keep track of everything that needs to be done"
            action={<Button onClick={() => setShowForm(true)}>Add first task</Button>}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {(['IN_PROGRESS', 'TODO', 'DONE'] as const).map((status) => {
              if (grouped[status].length === 0) return null;
              return (
                <div key={status}>
                  <p className="section-title">{STATUS_LABELS[status]} ({grouped[status].length})</p>
                  <div className="flex flex-col gap-2">
                    {grouped[status].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        tripId={tripId!}
                        onEdit={(t) => { setEditTask(t); setShowForm(true); }}
                        onDelete={setDeleteTask}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <TaskFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditTask(null); }}
          tripId={tripId!}
          editTask={editTask}
        />
        <ConfirmModal
          open={!!deleteTask}
          onClose={() => setDeleteTask(null)}
          onConfirm={() => deleteMutation.mutate()}
          loading={deleteMutation.isPending}
          title="Delete task"
          message={`Are you sure you want to delete "${deleteTask?.title}"?`}
        />
      </div>
    </TripLayout>
  );
}
