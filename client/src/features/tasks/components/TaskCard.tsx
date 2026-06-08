import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { Task } from '../../../types';
import { formatDate } from '../../../utils/date';
import { getMemberDisplayName } from '../../../utils/format';
import { tasksKeys } from '../hooks/useTasks';
import { tasksApi } from '../services/tasksApi';

const STATUS_COLORS = {
  TODO: 'gray',
  IN_PROGRESS: 'earth',
  DONE: 'green',
} as const;

export const STATUS_LABELS = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

interface TaskCardProps {
  task: Task;
  tripId: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, tripId, onEdit, onDelete }: TaskCardProps) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (status: Task['status']) => tasksApi.update(tripId, task.id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKeys.list(tripId) }),
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
          disabled={statusMutation.isPending}
          className={clsx(
            'w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors',
            task.status === 'DONE'
              ? 'bg-forest-500 border-forest-500 text-white'
              : task.status === 'IN_PROGRESS'
              ? 'border-earth-400 bg-earth-50'
              : 'border-stone-300 bg-white'
          )}
        >
          {statusMutation.isPending ? (
            <LoadingSpinner size="sm" />
          ) : task.status === 'DONE' && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-medium', task.status === 'DONE' ? 'line-through text-stone-400' : 'text-stone-800')}>
            {task.title}
          </p>
          {task.description && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{task.description}</p>}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
            {task.assignedTo && <span className="text-xs text-stone-500">Assigned to {getMemberDisplayName(task.assignedTo)}</span>}
            {task.dueDate && <span className="text-xs text-stone-500">Due {formatDate(task.dueDate)}</span>}
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
