import { useState } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface AddItemInputProps {
  onAdd: (text: string) => void;
  isPending?: boolean;
}

export function AddItemInput({ onAdd, isPending }: AddItemInputProps) {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);

  function submit() {
    const trimmed = text.trim();
    if (trimmed) {
      onAdd(trimmed);
      setText('');
    }
    setActive(false);
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        disabled={isPending}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-400 hover:text-forest-600 hover:bg-stone-50 rounded-lg transition-colors disabled:cursor-wait disabled:text-forest-500"
      >
        {isPending ? (
          <LoadingSpinner size="sm" />
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
        {isPending ? 'Adding item...' : 'Add item'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <input
        autoFocus
        disabled={isPending}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={submit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit();
          if (event.key === 'Escape') {
            setText('');
            setActive(false);
          }
        }}
        placeholder="Item name..."
        className="flex-1 text-sm border-b border-forest-400 bg-transparent focus:outline-none text-stone-800 py-1 disabled:cursor-wait disabled:opacity-70"
      />
      {isPending && <LoadingSpinner size="sm" />}
    </div>
  );
}
