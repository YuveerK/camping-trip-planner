import { useState } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { ChecklistCategory } from '../../../types';
import { AddItemInput } from './AddItemInput';
import { ChecklistItemRow } from './ChecklistItemRow';

interface ChecklistCategorySectionProps {
  category: ChecklistCategory;
  onToggle: (id: string, checked: boolean) => void;
  onRenameItem: (id: string, text: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (categoryId: string, text: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  pendingToggleItemId?: string;
  pendingRenameItemId?: string;
  pendingDeleteItemId?: string;
  isAddingItem?: boolean;
  isRenamingCategory?: boolean;
  isDeletingCategory?: boolean;
}

export function ChecklistCategorySection({
  category,
  onToggle,
  onRenameItem,
  onDeleteItem,
  onAddItem,
  onRenameCategory,
  onDeleteCategory,
  pendingToggleItemId,
  pendingRenameItemId,
  pendingDeleteItemId,
  isAddingItem,
  isRenamingCategory,
  isDeletingCategory,
}: ChecklistCategorySectionProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [collapsed, setCollapsed] = useState(false);
  const checked = category.items.filter((item) => item.isChecked).length;
  const sorted = [...category.items].sort((a, b) => Number(a.isChecked) - Number(b.isChecked));

  function commitName() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== category.name) onRenameCategory(category.id, trimmed);
    setEditingName(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-stone-50 border-b border-stone-200 group">
        <button onClick={() => setCollapsed((current) => !current)} className="text-stone-400 hover:text-stone-600 transition-colors">
          <svg className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {editingName ? (
          <input
            autoFocus
            disabled={isRenamingCategory}
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={() => { if (!isRenamingCategory) commitName(); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !isRenamingCategory) commitName();
              if (event.key === 'Escape' && !isRenamingCategory) setEditingName(false);
            }}
            className="flex-1 text-sm font-semibold bg-transparent border-b border-forest-400 focus:outline-none text-stone-800 disabled:cursor-wait disabled:opacity-70"
          />
        ) : (
          <span onDoubleClick={() => { setNameDraft(category.name); setEditingName(true); }} className="flex-1 text-sm font-semibold text-stone-700 cursor-default">
            {category.name}
          </span>
        )}

        <span className="text-xs text-stone-400 tabular-nums">{checked}/{category.items.length}</span>
        {isRenamingCategory && <LoadingSpinner size="sm" />}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { setNameDraft(category.name); setEditingName(true); }} disabled={isRenamingCategory || isDeletingCategory} className="p-1 text-stone-400 hover:text-stone-600 rounded disabled:cursor-wait disabled:opacity-50" title="Rename category">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.586-.626z" />
            </svg>
          </button>
          <button onClick={() => onDeleteCategory(category.id)} disabled={isDeletingCategory} className="p-1 text-stone-400 hover:text-red-500 rounded disabled:cursor-wait disabled:text-red-500" title={isDeletingCategory ? 'Deleting category' : 'Delete category'}>
            {isDeletingCategory ? (
              <LoadingSpinner size="sm" className="text-red-500" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1h4a1 1 0 001 1m-7 0H5" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="px-1 py-1">
          <ul>
            {sorted.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onRename={onRenameItem}
                onDelete={onDeleteItem}
                isToggling={pendingToggleItemId === item.id}
                isRenaming={pendingRenameItemId === item.id}
                isDeleting={pendingDeleteItemId === item.id}
              />
            ))}
          </ul>
          <AddItemInput onAdd={(text) => onAddItem(category.id, text)} isPending={isAddingItem} />
        </div>
      )}
    </div>
  );
}
