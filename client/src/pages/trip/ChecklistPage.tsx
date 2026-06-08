import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TripLayout } from '../../layouts/TripLayout';
import { checklistApi, type ChecklistItem } from '../../api/checklist';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export function ChecklistPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const qc = useQueryClient();
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['checklist', tripId],
    queryFn: () => checklistApi.getAll(tripId!),
    enabled: !!tripId,
  });

  const items: ChecklistItem[] = data?.data ?? [];
  const checkedCount = items.filter((i) => i.isChecked).length;

  const invalidate = () => qc.invalidateQueries({ queryKey: ['checklist', tripId] });

  const addMutation = useMutation({
    mutationFn: (text: string) => checklistApi.create(tripId!, text),
    onSuccess: () => { setNewText(''); invalidate(); },
    onError: () => toast.error('Failed to add item'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isChecked }: { id: string; isChecked: boolean }) =>
      checklistApi.update(tripId!, id, { isChecked }),
    onSuccess: invalidate,
    onError: () => toast.error('Failed to update item'),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      checklistApi.update(tripId!, id, { text }),
    onSuccess: () => { setEditingId(null); invalidate(); },
    onError: () => toast.error('Failed to rename item'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => checklistApi.delete(tripId!, id),
    onSuccess: invalidate,
    onError: () => toast.error('Failed to delete item'),
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    addMutation.mutate(text);
  }

  function startEdit(item: ChecklistItem) {
    setEditingId(item.id);
    setEditText(item.text);
  }

  function commitEdit(id: string) {
    const text = editText.trim();
    if (!text) { setEditingId(null); return; }
    renameMutation.mutate({ id, text });
  }

  return (
    <TripLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-stone-800">My Checklist</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Your personal list — only you can see this.
          </p>
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className="flex justify-between text-sm font-medium text-stone-700 mb-2">
              <span>Progress</span>
              <span>{checkedCount}/{items.length} packed</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-forest-500 rounded-full transition-all duration-300"
                style={{ width: `${items.length ? (checkedCount / items.length) * 100 : 0}%` }}
              />
            </div>
            {checkedCount === items.length && items.length > 0 && (
              <p className="text-xs text-forest-600 font-medium mt-2 text-center">
                All packed — you're ready!
              </p>
            )}
          </div>
        )}

        {/* Add item */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            ref={inputRef}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add an item (e.g. sleeping bag)"
            className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-400"
          />
          <button
            type="submit"
            disabled={!newText.trim() || addMutation.isPending}
            className="rounded-xl bg-forest-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-forest-700 transition-colors"
          >
            Add
          </button>
        </form>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-14 text-stone-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm font-medium">Nothing on your list yet</p>
            <p className="text-xs mt-1">Add items you personally need to bring</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {/* Unchecked first */}
            {[...items].sort((a, b) => Number(a.isChecked) - Number(b.isChecked)).map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 px-4 py-3 group"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleMutation.mutate({ id: item.id, isChecked: !item.isChecked })}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.isChecked
                      ? 'border-forest-500 bg-forest-500'
                      : 'border-stone-300 hover:border-forest-400'
                  }`}
                >
                  {item.isChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Text / edit */}
                {editingId === item.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => commitEdit(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(item.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 text-sm bg-transparent border-b border-forest-400 focus:outline-none text-stone-800"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(item)}
                    className={`flex-1 text-sm cursor-default select-none ${
                      item.isChecked ? 'line-through text-stone-400' : 'text-stone-700'
                    }`}
                  >
                    {item.text}
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1 text-stone-400 hover:text-stone-600 rounded"
                    title="Rename"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.586-.626z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="p-1 text-stone-400 hover:text-red-500 rounded"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1h4a1 1 0 001 1m-7 0H5" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </TripLayout>
  );
}
