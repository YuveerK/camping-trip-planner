import { AddCategoryInput } from './AddCategoryInput';

interface AddCategorySectionProps {
  isAdding: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onStart: () => void;
  isPending?: boolean;
}

export function AddCategorySection({
  isAdding,
  value,
  onChange,
  onSubmit,
  onCancel,
  onStart,
  isPending,
}: AddCategorySectionProps) {
  if (isAdding) {
    return (
      <AddCategoryInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isPending={isPending}
      />
    );
  }

  return (
    <button
      onClick={onStart}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 py-3 text-sm text-stone-400 hover:border-forest-300 hover:text-forest-600 transition-colors disabled:cursor-wait disabled:opacity-60"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Add category
    </button>
  );
}
