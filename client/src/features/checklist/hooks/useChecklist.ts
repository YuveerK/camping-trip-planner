import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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

export function useChecklistMutations(tripId: string | undefined, options: ChecklistMutationOptions) {
  const queryClient = useQueryClient();
  const invalidateMine = () => queryClient.invalidateQueries({ queryKey: checklistKeys.mine(tripId) });
  const invalidateTrip = () => queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) });

  const addCategory = useMutation({
    mutationFn: (name: string) => checklistApi.createCategory(tripId!, name),
    onSuccess: () => {
      options.onCategoryCreated?.();
      invalidateMine();
    },
    onError: () => toast.error('Failed to create category'),
  });

  const renameCategory = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => checklistApi.updateCategory(tripId!, id, name),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to rename category'),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => checklistApi.deleteCategory(tripId!, id),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to delete category'),
  });

  const addItem = useMutation({
    mutationFn: ({ text, categoryId }: { text: string; categoryId?: string | null }) => checklistApi.create(tripId!, text, categoryId),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to add item'),
  });

  const toggleItem = useMutation({
    mutationFn: ({ id, isChecked }: { id: string; isChecked: boolean }) => checklistApi.update(tripId!, id, { isChecked }),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to update item'),
  });

  const renameItem = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => checklistApi.update(tripId!, id, { text }),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to rename item'),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => checklistApi.delete(tripId!, id),
    onSuccess: invalidateMine,
    onError: () => toast.error('Failed to delete item'),
  });

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
