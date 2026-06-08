import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripLayout } from '../../../components/layout/TripLayout';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageLoader } from '../../../components/ui/LoadingSpinner';
import { ConfirmModal } from '../../../components/ui/Modal';
import type { Task } from '../../../types';
import { TaskFormModal } from '../components/TaskFormModal';
import { TasksBoard } from '../components/TasksBoard';
import { useDeleteTask, useTasks } from '../hooks/useTasks';

export function TasksPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const { data, isLoading } = useTasks(tripId);
  const tasks = data?.data ?? [];
  const deleteMutation = useDeleteTask(tripId, () => setDeleteTask(null));

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
          <EmptyState icon="Tasks" title="No tasks yet" description="Add tasks to keep track of everything that needs to be done" action={<Button onClick={() => setShowForm(true)}>Add first task</Button>} />
        ) : (
          <TasksBoard tasks={tasks} tripId={tripId!} onEdit={(task) => { setEditTask(task); setShowForm(true); }} onDelete={setDeleteTask} />
        )}

        <TaskFormModal key={editTask?.id ?? 'new'} open={showForm} onClose={() => { setShowForm(false); setEditTask(null); }} tripId={tripId!} editTask={editTask} />
        <ConfirmModal open={!!deleteTask} onClose={() => setDeleteTask(null)} onConfirm={() => deleteTask && deleteMutation.mutate(deleteTask.id)} loading={deleteMutation.isPending} title="Delete task" message={`Are you sure you want to delete "${deleteTask?.title}"?`} />
      </div>
    </TripLayout>
  );
}
