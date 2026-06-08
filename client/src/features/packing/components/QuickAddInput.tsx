import { useState } from 'react';

interface QuickAddInputProps {
  onAdd: (name: string) => void;
  onOpenFull: () => void;
  isPending?: boolean;
}

export function QuickAddInput({ onAdd, onOpenFull, isPending }: QuickAddInputProps) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState('');

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
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-stone-400 hover:text-forest-600 hover:bg-stone-50 transition-colors border-t border-stone-100 disabled:cursor-wait disabled:text-forest-500"
      >
        {isPending ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        )}
        {isPending ? 'Adding item...' : 'Quick add item'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-stone-100 bg-stone-50">
      <input
        autoFocus
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
        placeholder="Item name, press Enter to add..."
        className="flex-1 text-sm bg-transparent border-b border-forest-400 focus:outline-none text-stone-800 py-1"
      />
      <button onClick={onOpenFull} disabled={isPending} className="text-xs text-stone-400 hover:text-forest-600 whitespace-nowrap disabled:cursor-wait disabled:opacity-60" title="Add with full details">
        More options
      </button>
    </div>
  );
}
