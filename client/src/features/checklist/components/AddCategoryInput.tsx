import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface AddCategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function AddCategoryInput({ value, onChange, onSubmit, onCancel, isPending }: AddCategoryInputProps) {
  return (
    <div className="bg-white rounded-2xl border border-forest-300 px-4 py-3 flex items-center gap-2">
      <input
        autoFocus
        disabled={isPending}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => { if (!isPending) onSubmit(); }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !isPending) onSubmit();
          if (event.key === 'Escape' && !isPending) onCancel();
        }}
        placeholder="Category name (e.g. Safety First)"
        className="flex-1 text-sm text-stone-800 placeholder:text-stone-400 bg-transparent focus:outline-none disabled:cursor-wait disabled:opacity-70"
      />
      {isPending && <LoadingSpinner size="sm" />}
    </div>
  );
}
