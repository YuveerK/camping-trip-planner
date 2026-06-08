import type { ChecklistItem } from '../../../types';
import { AddItemInput } from './AddItemInput';
import { ChecklistItemRow } from './ChecklistItemRow';

interface UncategorizedChecklistProps {
  categoriesCount: number;
  items: ChecklistItem[];
  onToggle: (id: string, checked: boolean) => void;
  onRename: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string) => void;
  pendingToggleItemId?: string;
  pendingRenameItemId?: string;
  pendingDeleteItemId?: string;
  isAddingItem?: boolean;
}

export function UncategorizedChecklist({
  categoriesCount,
  items,
  onToggle,
  onRename,
  onDelete,
  onAdd,
  pendingToggleItemId,
  pendingRenameItemId,
  pendingDeleteItemId,
  isAddingItem,
}: UncategorizedChecklistProps) {
  if (items.length === 0 && categoriesCount > 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {categoriesCount > 0 && (
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
          <span className="text-sm font-semibold text-stone-500">Other</span>
        </div>
      )}
      <div className="px-1 py-1">
        {items.length === 0 && categoriesCount === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <p className="text-sm font-medium">Nothing on your list yet</p>
            <p className="text-xs mt-1">Add a category or start adding items below</p>
          </div>
        ) : (
          <ul>
            {items.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onRename={onRename}
                onDelete={onDelete}
                isToggling={pendingToggleItemId === item.id}
                isRenaming={pendingRenameItemId === item.id}
                isDeleting={pendingDeleteItemId === item.id}
              />
            ))}
          </ul>
        )}
        <AddItemInput onAdd={onAdd} isPending={isAddingItem} />
      </div>
    </div>
  );
}
