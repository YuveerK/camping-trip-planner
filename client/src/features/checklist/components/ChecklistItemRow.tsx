import { useState } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { ChecklistItem } from '../../../types';
import { CheckIcon } from './CheckIcon';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onToggle: (id: string, checked: boolean) => void;
  onRename: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
  isRenaming?: boolean;
  isDeleting?: boolean;
}

export function ChecklistItemRow({ item, onToggle, onRename, onDelete, isToggling, isRenaming, isDeleting }: ChecklistItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.text) onRename(item.id, trimmed);
    setEditing(false);
  }

  return (
    <li className="flex items-center gap-3 px-3 py-2.5 group hover:bg-stone-50 rounded-lg transition-colors">
      <button
        onClick={() => onToggle(item.id, !item.isChecked)}
        disabled={isToggling}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.isChecked ? 'border-forest-500 bg-forest-500' : 'border-stone-300 hover:border-forest-400'
        } disabled:cursor-wait disabled:opacity-80`}
      >
        {isToggling ? <LoadingSpinner size="sm" /> : item.isChecked && <CheckIcon className="w-3 h-3 text-white" />}
      </button>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') setEditing(false);
          }}
          className="flex-1 text-sm bg-transparent border-b border-forest-400 focus:outline-none text-stone-800"
        />
      ) : (
        <span className="flex flex-1 items-center gap-2 min-w-0">
          <span
            onDoubleClick={() => { if (!isRenaming) { setDraft(item.text); setEditing(true); } }}
            className={`min-w-0 flex-1 text-sm cursor-default select-none truncate ${item.isChecked ? 'line-through text-stone-400' : 'text-stone-700'}`}
          >
            {item.text}
          </span>
          {isRenaming && <LoadingSpinner size="sm" />}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => { setDraft(item.text); setEditing(true); }} disabled={isRenaming || isDeleting} className="p-1 text-stone-400 hover:text-stone-600 rounded disabled:cursor-wait disabled:opacity-50" title="Rename">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.586-.626z" />
          </svg>
        </button>
        <button onClick={() => onDelete(item.id)} disabled={isDeleting} className="p-1 text-stone-400 hover:text-red-500 rounded disabled:cursor-wait disabled:text-red-500" title={isDeleting ? 'Deleting item' : 'Delete'}>
          {isDeleting ? (
            <LoadingSpinner size="sm" className="text-red-500" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1h4a1 1 0 001 1m-7 0H5" />
            </svg>
          )}
        </button>
      </div>
    </li>
  );
}
