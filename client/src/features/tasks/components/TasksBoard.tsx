import type { Task } from '../../../types';
import { STATUS_LABELS, TaskCard } from './TaskCard';

interface TasksBoardProps {
  tasks: Task[];
  tripId: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TasksBoard({ tasks, tripId, onEdit, onDelete }: TasksBoardProps) {
  const grouped = {
    TODO: tasks.filter((task) => task.status === 'TODO'),
    IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS'),
    DONE: tasks.filter((task) => task.status === 'DONE'),
  };

  return (
    <div className="flex flex-col gap-4">
      {(['IN_PROGRESS', 'TODO', 'DONE'] as const).map((status) => {
        if (grouped[status].length === 0) return null;
        return (
          <div key={status}>
            <p className="section-title">{STATUS_LABELS[status]} ({grouped[status].length})</p>
            <div className="flex flex-col gap-2">
              {grouped[status].map((task) => (
                <TaskCard key={task.id} task={task} tripId={tripId} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
