import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TripLayout } from '../../layouts/TripLayout';
import { tripsApi } from '../../api/trips';
import { checklistApi } from '../../api/checklist';
import type { ChecklistItem, ChecklistCategory } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

// ── Shared helpers ────────────────────────────────────────────────────────────

function CheckIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function totalProgress(categories: ChecklistCategory[], uncategorized: ChecklistItem[]) {
  const all = [...categories.flatMap((c) => c.items), ...uncategorized];
  return { checked: all.filter((i) => i.isChecked).length, total: all.length };
}

// ── Item row (interactive) ────────────────────────────────────────────────────

function ItemRow({
  item,
  onToggle,
  onRename,
  onDelete,
}: {
  item: ChecklistItem;
  onToggle: (id: string, checked: boolean) => void;
  onRename: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);

  function commit() {
    const t = draft.trim();
    if (t && t !== item.text) onRename(item.id, t);
    setEditing(false);
  }

  return (
    <li className="flex items-center gap-3 px-3 py-2.5 group hover:bg-stone-50 rounded-lg transition-colors">
      <button
        onClick={() => onToggle(item.id, !item.isChecked)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.isChecked ? 'border-forest-500 bg-forest-500' : 'border-stone-300 hover:border-forest-400'
        }`}
      >
        {item.isChecked && <CheckIcon className="w-3 h-3 text-white" />}
      </button>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="flex-1 text-sm bg-transparent border-b border-forest-400 focus:outline-none text-stone-800"
        />
      ) : (
        <span
          onDoubleClick={() => { setDraft(item.text); setEditing(true); }}
          className={`flex-1 text-sm cursor-default select-none ${
            item.isChecked ? 'line-through text-stone-400' : 'text-stone-700'
          }`}
        >
          {item.text}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => { setDraft(item.text); setEditing(true); }}
          className="p-1 text-stone-400 hover:text-stone-600 rounded"
          title="Rename"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.586-.626z" />
          </svg>
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1 text-stone-400 hover:text-red-500 rounded" title="Delete">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1h4a1 1 0 001 1m-7 0H5" />
          </svg>
        </button>
      </div>
    </li>
  );
}

// ── Add-item inline input ─────────────────────────────────────────────────────

function AddItemInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);

  function submit() {
    const t = text.trim();
    if (t) { onAdd(t); setText(''); }
    setActive(false);
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-400 hover:text-forest-600 hover:bg-stone-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add item
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') { setText(''); setActive(false); }
        }}
        placeholder="Item name..."
        className="flex-1 text-sm border-b border-forest-400 bg-transparent focus:outline-none text-stone-800 py-1"
      />
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────────────────

function CategorySection({
  category,
  onToggle,
  onRenameItem,
  onDeleteItem,
  onAddItem,
  onRenameCategory,
  onDeleteCategory,
}: {
  category: ChecklistCategory;
  onToggle: (id: string, checked: boolean) => void;
  onRenameItem: (id: string, text: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (categoryId: string, text: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [collapsed, setCollapsed] = useState(false);
  const checked = category.items.filter((i) => i.isChecked).length;

  function commitName() {
    const n = nameDraft.trim();
    if (n && n !== category.name) onRenameCategory(category.id, n);
    setEditingName(false);
  }

  const sorted = [...category.items].sort((a, b) => Number(a.isChecked) - Number(b.isChecked));

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Category header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-stone-50 border-b border-stone-200 group">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-stone-400 hover:text-stone-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
            className="flex-1 text-sm font-semibold bg-transparent border-b border-forest-400 focus:outline-none text-stone-800"
          />
        ) : (
          <span
            onDoubleClick={() => { setNameDraft(category.name); setEditingName(true); }}
            className="flex-1 text-sm font-semibold text-stone-700 cursor-default"
          >
            {category.name}
          </span>
        )}

        <span className="text-xs text-stone-400 tabular-nums">{checked}/{category.items.length}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => { setNameDraft(category.name); setEditingName(true); }}
            className="p-1 text-stone-400 hover:text-stone-600 rounded"
            title="Rename category"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.586-.626z" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="p-1 text-stone-400 hover:text-red-500 rounded"
            title="Delete category"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1h4a1 1 0 001 1m-7 0H5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <div className="px-1 py-1">
          <ul>
            {sorted.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onRename={onRenameItem}
                onDelete={onDeleteItem}
              />
            ))}
          </ul>
          <AddItemInput onAdd={(text) => onAddItem(category.id, text)} />
        </div>
      )}
    </div>
  );
}

// ── Read-only item (owner reference) ─────────────────────────────────────────

function ReadOnlyItem({ item }: { item: ChecklistItem }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          item.isChecked ? 'border-forest-400 bg-forest-400' : 'border-stone-300'
        }`}
      >
        {item.isChecked && <CheckIcon className="w-3 h-3 text-white" />}
      </span>
      <span className={`text-sm ${item.isChecked ? 'line-through text-stone-400' : 'text-stone-600'}`}>
        {item.text}
      </span>
    </li>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ChecklistPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getOne(tripId!),
    enabled: !!tripId,
  });
  const trip = tripData?.data;
  const myMember = trip?.members.find((m) => m.user?.id === user?.id);
  const isOwner = myMember?.role === 'OWNER';
  const checklistIsPublic = myMember?.checklistIsPublic ?? false;

  const { data: myData, isLoading } = useQuery({
    queryKey: ['checklist', tripId],
    queryFn: () => checklistApi.getAll(tripId!),
    enabled: !!tripId,
  });
  const categories = myData?.data?.categories ?? [];
  const uncategorized = myData?.data?.uncategorized ?? [];

  const { data: ownerData } = useQuery({
    queryKey: ['checklist-owner', tripId],
    queryFn: () => checklistApi.getOwnerItems(tripId!),
    enabled: !!tripId && !isOwner,
  });
  const ownerChecklist = ownerData?.data;

  const invalidateMine = () => qc.invalidateQueries({ queryKey: ['checklist', tripId] });
  const invalidateTrip = () => qc.invalidateQueries({ queryKey: ['trip', tripId] });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addCategoryMut = useMutation({
    mutationFn: (name: string) => checklistApi.createCategory(tripId!, name),
    onSuccess: () => { setNewCategoryName(''); setAddingCategory(false); invalidateMine(); },
    onError: () => toast.error('Failed to create category'),
  });

  const renameCategoryMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => checklistApi.updateCategory(tripId!, id, name),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to rename category'),
  });

  const deleteCategoryMut = useMutation({
    mutationFn: (id: string) => checklistApi.deleteCategory(tripId!, id),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to delete category'),
  });

  const addItemMut = useMutation({
    mutationFn: ({ text, categoryId }: { text: string; categoryId?: string | null }) =>
      checklistApi.create(tripId!, text, categoryId),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to add item'),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isChecked }: { id: string; isChecked: boolean }) =>
      checklistApi.update(tripId!, id, { isChecked }),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to update item'),
  });

  const renameMut = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      checklistApi.update(tripId!, id, { text }),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to rename item'),
  });

  const deleteItemMut = useMutation({
    mutationFn: (id: string) => checklistApi.delete(tripId!, id),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to delete item'),
  });

  const visibilityMut = useMutation({
    mutationFn: (isPublic: boolean) => checklistApi.setVisibility(tripId!, isPublic),
    onSuccess: () => {
      invalidateTrip();
      toast.success(checklistIsPublic ? 'Checklist is now private' : 'Checklist shared with the group');
    },
    onError: () => toast.error('Failed to update visibility'),
  });

  // ── Shared item handlers ──────────────────────────────────────────────────

  const handleToggle = (id: string, checked: boolean) => toggleMut.mutate({ id, isChecked: checked });
  const handleRenameItem = (id: string, text: string) => renameMut.mutate({ id, text });
  const handleDeleteItem = (id: string) => deleteItemMut.mutate(id);
  const handleAddItem = (text: string, categoryId?: string | null) =>
    addItemMut.mutate({ text, categoryId });

  const { checked, total } = totalProgress(categories, uncategorized);
  const sortedUncategorized = [...uncategorized].sort((a, b) => Number(a.isChecked) - Number(b.isChecked));

  function submitCategory() {
    const n = newCategoryName.trim();
    if (n) addCategoryMut.mutate(n);
    else setAddingCategory(false);
  }

  return (
    <TripLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-800">My Checklist</h2>
            <p className="text-sm text-stone-500 mt-0.5">Your personal packing reference — fully private to you.</p>
          </div>

          {isOwner && (
            <button
              onClick={() => visibilityMut.mutate(!checklistIsPublic)}
              disabled={visibilityMut.isPending}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold border transition-colors shrink-0 ${
                checklistIsPublic
                  ? 'bg-forest-50 border-forest-300 text-forest-700 hover:bg-forest-100'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span className={`w-7 h-4 rounded-full flex items-center transition-colors ${checklistIsPublic ? 'bg-forest-500' : 'bg-stone-300'}`}>
                <span className={`w-3 h-3 rounded-full bg-white shadow mx-0.5 transition-transform ${checklistIsPublic ? 'translate-x-3' : 'translate-x-0'}`} />
              </span>
              {checklistIsPublic ? 'Shared with group' : 'Private'}
            </button>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className="flex justify-between text-sm font-medium text-stone-700 mb-2">
              <span>Progress</span>
              <span>{checked}/{total} packed</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-forest-500 rounded-full transition-all duration-300"
                style={{ width: `${(checked / total) * 100}%` }}
              />
            </div>
            {checked === total && total > 0 && (
              <p className="text-xs text-forest-600 font-medium mt-2 text-center">All packed — you're ready!</p>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            {/* Category sections */}
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                onToggle={handleToggle}
                onRenameItem={handleRenameItem}
                onDeleteItem={handleDeleteItem}
                onAddItem={(catId, text) => handleAddItem(text, catId)}
                onRenameCategory={(id, name) => renameCategoryMut.mutate({ id, name })}
                onDeleteCategory={(id) => deleteCategoryMut.mutate(id)}
              />
            ))}

            {/* Uncategorized items */}
            {(uncategorized.length > 0 || categories.length === 0) && (
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                {categories.length > 0 && (
                  <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
                    <span className="text-sm font-semibold text-stone-500">Other</span>
                  </div>
                )}
                <div className="px-1 py-1">
                  {sortedUncategorized.length === 0 && categories.length === 0 ? (
                    <div className="text-center py-8 text-stone-400">
                      <p className="text-4xl mb-3">📋</p>
                      <p className="text-sm font-medium">Nothing on your list yet</p>
                      <p className="text-xs mt-1">Add a category or start adding items below</p>
                    </div>
                  ) : (
                    <ul>
                      {sortedUncategorized.map((item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          onToggle={handleToggle}
                          onRename={handleRenameItem}
                          onDelete={handleDeleteItem}
                        />
                      ))}
                    </ul>
                  )}
                  <AddItemInput onAdd={(text) => handleAddItem(text, null)} />
                </div>
              </div>
            )}

            {/* Add category */}
            {addingCategory ? (
              <div className="bg-white rounded-2xl border border-forest-300 px-4 py-3 flex items-center gap-2">
                <input
                  ref={categoryInputRef}
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onBlur={submitCategory}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitCategory();
                    if (e.key === 'Escape') { setNewCategoryName(''); setAddingCategory(false); }
                  }}
                  placeholder="Category name (e.g. Safety First)"
                  className="flex-1 text-sm text-stone-800 placeholder:text-stone-400 bg-transparent focus:outline-none"
                />
              </div>
            ) : (
              <button
                onClick={() => setAddingCategory(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 py-3 text-sm text-stone-400 hover:border-forest-300 hover:text-forest-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add category
              </button>
            )}
          </>
        )}

        {/* Owner reference section */}
        {!isOwner && ownerChecklist?.isPublic && (ownerChecklist.categories.length > 0 || ownerChecklist.uncategorized.length > 0) && (
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs font-medium text-stone-400 px-2">
                {ownerChecklist.ownerName}'s reference list
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>
            <p className="text-xs text-stone-400 text-center -mt-1">
              Read-only — use it to make sure you haven't missed anything
            </p>

            {ownerChecklist.categories.map((cat) => (
              <div key={cat.id} className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200">
                  <span className="text-sm font-semibold text-stone-600">{cat.name}</span>
                  <span className="ml-2 text-xs text-stone-400">
                    {cat.items.filter((i) => i.isChecked).length}/{cat.items.length}
                  </span>
                </div>
                <ul className="px-1 py-1">
                  {cat.items.map((item) => <ReadOnlyItem key={item.id} item={item} />)}
                </ul>
              </div>
            ))}

            {ownerChecklist.uncategorized.length > 0 && (
              <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden">
                {ownerChecklist.categories.length > 0 && (
                  <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200">
                    <span className="text-sm font-semibold text-stone-500">Other</span>
                  </div>
                )}
                <ul className="px-1 py-1">
                  {ownerChecklist.uncategorized.map((item) => <ReadOnlyItem key={item.id} item={item} />)}
                </ul>
              </div>
            )}
          </div>
        )}

        {!isOwner && ownerChecklist && !ownerChecklist.isPublic && (
          <p className="text-center text-xs text-stone-400 pt-2">
            The trip owner hasn't shared their checklist yet.
          </p>
        )}
      </div>
    </TripLayout>
  );
}
