import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface ChecklistHeaderProps {
  isOwner: boolean;
  isPublic: boolean;
  isPending: boolean;
  onTogglePublic: () => void;
}

export function ChecklistHeader({ isOwner, isPublic, isPending, onTogglePublic }: ChecklistHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-stone-800">My Checklist</h2>
        <p className="text-sm text-stone-500 mt-0.5">Your personal packing reference. Fully private to you.</p>
      </div>
      {isOwner && (
        <button
          onClick={onTogglePublic}
          disabled={isPending}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold border transition-colors shrink-0 ${
            isPublic
              ? 'bg-forest-50 border-forest-300 text-forest-700 hover:bg-forest-100'
              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span className={`w-7 h-4 rounded-full flex items-center transition-colors ${isPublic ? 'bg-forest-500' : 'bg-stone-300'}`}>
            <span className={`w-3 h-3 rounded-full bg-white shadow mx-0.5 transition-transform ${isPublic ? 'translate-x-3' : 'translate-x-0'}`} />
          </span>
          {isPending && <LoadingSpinner size="sm" />}
          {isPending ? 'Updating...' : isPublic ? 'Shared with group' : 'Private'}
        </button>
      )}
    </div>
  );
}
