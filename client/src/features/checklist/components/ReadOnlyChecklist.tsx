import type { ChecklistItem, OwnerChecklistData } from '../../../types';
import { CheckIcon } from './CheckIcon';

function ReadOnlyItem({ item }: { item: ChecklistItem }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.isChecked ? 'border-forest-400 bg-forest-400' : 'border-stone-300'}`}>
        {item.isChecked && <CheckIcon className="w-3 h-3 text-white" />}
      </span>
      <span className={`text-sm ${item.isChecked ? 'line-through text-stone-400' : 'text-stone-600'}`}>
        {item.text}
      </span>
    </li>
  );
}

export function ReadOnlyChecklist({ checklist, isOwner }: { checklist?: OwnerChecklistData; isOwner: boolean }) {
  if (isOwner || !checklist) return null;

  if (!checklist.isPublic) {
    return (
      <p className="text-center text-xs text-stone-400 pt-2">
        The trip owner has not shared their checklist yet.
      </p>
    );
  }

  if (checklist.categories.length === 0 && checklist.uncategorized.length === 0) return null;

  return (
    <div className="pt-2 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs font-medium text-stone-400 px-2">{checklist.ownerName}'s reference list</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>
      <p className="text-xs text-stone-400 text-center -mt-1">
        Read-only. Use it to make sure you have not missed anything.
      </p>

      {checklist.categories.map((cat) => (
        <div key={cat.id} className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200">
            <span className="text-sm font-semibold text-stone-600">{cat.name}</span>
            <span className="ml-2 text-xs text-stone-400">
              {cat.items.filter((item) => item.isChecked).length}/{cat.items.length}
            </span>
          </div>
          <ul className="px-1 py-1">
            {cat.items.map((item) => <ReadOnlyItem key={item.id} item={item} />)}
          </ul>
        </div>
      ))}

      {checklist.uncategorized.length > 0 && (
        <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden">
          {checklist.categories.length > 0 && (
            <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200">
              <span className="text-sm font-semibold text-stone-500">Other</span>
            </div>
          )}
          <ul className="px-1 py-1">
            {checklist.uncategorized.map((item) => <ReadOnlyItem key={item.id} item={item} />)}
          </ul>
        </div>
      )}
    </div>
  );
}
