import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { ApiResponse, ChecklistData, ChecklistItem } from '../../../types';
import { tripsKeys } from '../../trips/hooks/useTrips';
import { checklistApi } from '../services/checklistApi';

export const checklistKeys = {
  mine: (tripId: string | undefined) => ['checklist', tripId] as const,
  owner: (tripId: string | undefined) => ['checklist-owner', tripId] as const,
};

export function useChecklist(tripId: string | undefined) {
  return useQuery({
    queryKey: checklistKeys.mine(tripId),
    queryFn: () => checklistApi.getAll(tripId!),
    enabled: !!tripId,
  });
}

export function useOwnerChecklist(tripId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: checklistKeys.owner(tripId),
    queryFn: () => checklistApi.getOwnerItems(tripId!),
    enabled: enabled && !!tripId,
  });
}

interface ChecklistMutationOptions {
  checklistIsPublic: boolean;
  onCategoryCreated?: () => void;
}

// Applies an update to the checklist data in the cache.
function patchChecklist(
  qc: ReturnType<typeof useQueryClient>,
  key: ReturnType<typeof checklistKeys.mine>,
  updater: (data: ChecklistData) => ChecklistData,
) {
  qc.setQueryData<ApiResponse<ChecklistData>>(key, (old) =>
    old ? { ...old, data: updater(old.data) } : old,
  );
}

// Finds and updates an item wherever it lives (inside a category or uncategorized).
function patchItem(
  data: ChecklistData,
  itemId: string,
  updater: (item: ChecklistItem) => ChecklistItem,
): ChecklistData {
  return {
    ...data,
    categories: data.categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => item.id === itemId ? updater(item) : item),
    })),
    uncategorized: data.uncategorized.map((item) => item.id === itemId ? updater(item) : item),
  };
}

// Removes an item from wherever it lives.
function removeItem(data: ChecklistData, itemId: string): ChecklistData {
  return {
    ...data,
    categories: data.categories.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.id !== itemId),
    })),
    uncategorized: data.uncategorized.filter((item) => item.id !== itemId),
  };
}

export function useChecklistMutations(tripId: string | undefined, options: ChecklistMutationOptions) {
  const qc = useQueryClient();
  const key = checklistKeys.mine(tripId);

  const invalidateMine = () => qc.invalidateQueries({ queryKey: key });
  const invalidateTrip = () => qc.invalidateQueries({ queryKey: tripsKeys.detail(tripId) });

  const snapshot = () => qc.getQueryData(key);
  const rollback = (prev: unknown) => { if (prev) qc.setQueryData(key, prev); };

  // ── Categories ──────────────────────────────────────────────────────────────

  const addCategory = useMutation({
    mutationFn: (name: string) => checklistApi.createCategory(tripId!, name),
    onSuccess: (data) => {
      patchChecklist(qc, key, (old) => ({ ...old, categories: [...old.categories, data.data] }));
      invalidateMine();
      options.onCategoryCreated?.();
    },
    onError: () => toast.error('Failed to create category'),
  });

  const renameCategory = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => checklistApi.updateCategory(tripId!, id, name),
    onSuccess: (data) => {
      patchChecklist(qc, key, (old) => ({
        ...old,
        categories: old.categories.map((cat) => cat.id === data.data.id ? { ...cat, name: data.data.name } : cat),
      }));
      invalidateMine();
    },
    onError: () => toast.error('Failed to rename category'),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => checklistApi.deleteCategory(tripId!, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = snapshot();
      patchChecklist(qc, key, (old) => {
        const cat = old.categories.find((c) => c.id === id);
        // Items become uncategorized (mirrors Prisma SetNull)
        const freed = (cat?.items ?? []).map((item) => ({ ...item, categoryId: null as string | null }));
        return {
          ...old,
          categories: old.categories.filter((c) => c.id !== id),
          uncategorized: [...old.uncategorized, ...freed],
        };
      });
      return { prev };
    },
    onError: (_, __, context) => { rollback(context?.prev); toast.error('Failed to delete category'); },
    onSettled: invalidateMine,
  });

  // ── Items ───────────────────────────────────────────────────────────────────

  const addItem = useMutation({
    mutationFn: ({ text, categoryId }: { text: string; categoryId?: string | null }) =>
      checklistApi.create(tripId!, text, categoryId),
    onSuccess: (data) => {
      const newItem = data.data;
      patchChecklist(qc, key, (old) => {
        if (newItem.categoryId) {
          return {
            ...old,
            categories: old.categories.map((cat) =>
              cat.id === newItem.categoryId ? { ...cat, items: [...cat.items, newItem] } : cat,
            ),
          };
        }
        return { ...old, uncategorized: [...old.uncategorized, newItem] };
      });
      invalidateMine();
    },
    onError: () => toast.error('Failed to add item'),
  });

  const toggleItem = useMutation({
    mutationFn: ({ id, isChecked }: { id: string; isChecked: boolean }) =>
      checklistApi.update(tripId!, id, { isChecked }),
    onMutate: async ({ id, isChecked }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = snapshot();
      patchChecklist(qc, key, (old) => patchItem(old, id, (item) => ({ ...item, isChecked })));
      return { prev };
    },
    onError: (_, __, context) => { rollback(context?.prev); toast.error('Failed to update item'); },
    onSettled: invalidateMine,
  });

  const renameItem = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      checklistApi.update(tripId!, id, { text }),
    onSuccess: (data) => {
      patchChecklist(qc, key, (old) => patchItem(old, data.data.id, () => data.data));
      invalidateMine();
    },
    onError: () => toast.error('Failed to rename item'),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => checklistApi.delete(tripId!, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = snapshot();
      patchChecklist(qc, key, (old) => removeItem(old, id));
      return { prev };
    },
    onError: (_, __, context) => { rollback(context?.prev); toast.error('Failed to delete item'); },
    onSettled: invalidateMine,
  });

  // ── Visibility ──────────────────────────────────────────────────────────────

  const setVisibility = useMutation({
    mutationFn: (isPublic: boolean) => checklistApi.setVisibility(tripId!, isPublic),
    onSuccess: () => {
      invalidateTrip();
      toast.success(options.checklistIsPublic ? 'Checklist is now private' : 'Checklist shared with the group');
    },
    onError: () => toast.error('Failed to update visibility'),
  });

  return {
    addCategory,
    renameCategory,
    deleteCategory,
    addItem,
    toggleItem,
    renameItem,
    deleteItem,
    setVisibility,
  };
}
