import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { checklistKeys } from '../../checklist/hooks/useChecklist';
import { checklistApi } from '../../checklist/services/checklistApi';
import { packingApi } from '../services/packingApi';

export const packingKeys = {
  items: (tripId: string | undefined) => ['packing', tripId] as const,
  categories: (tripId: string | undefined) => ['packing-categories', tripId] as const,
};

export function usePackingItems(tripId: string | undefined) {
  return useQuery({
    queryKey: packingKeys.items(tripId),
    queryFn: () => packingApi.getAll(tripId!),
    enabled: !!tripId,
  });
}

export function usePackingCategories(tripId: string | undefined) {
  return useQuery({
    queryKey: packingKeys.categories(tripId),
    queryFn: () => packingApi.getCategories(tripId!),
    enabled: !!tripId,
  });
}

export function useLoadPackingTemplate(tripId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => packingApi.loadTemplate(tripId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packingKeys.items(tripId) });
      queryClient.invalidateQueries({ queryKey: packingKeys.categories(tripId) });
      toast.success('Template loaded. Delete anything that does not apply.');
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load template'),
  });
}

export function useQuickAddPackingItem(tripId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, categoryId }: { name: string; categoryId?: string }) =>
      packingApi.create(tripId!, { name, categoryId: categoryId ?? null, requiredQuantity: 1, priority: 'MEDIUM', isSharedItem: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packingKeys.items(tripId) });
      queryClient.invalidateQueries({ queryKey: packingKeys.categories(tripId) });
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add item'),
  });
}

export function useDeletePackingCategory(tripId: string | undefined, onDeleted?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => packingApi.deleteCategory(tripId!, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packingKeys.items(tripId) });
      queryClient.invalidateQueries({ queryKey: packingKeys.categories(tripId) });
      toast.success('Category and items deleted');
      onDeleted?.();
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete category'),
  });
}

export function useTransferPackingCategoryToChecklist(
  tripId: string | undefined,
  getCategoryName: (categoryId: string) => string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packingCategoryId: string) => checklistApi.importPackingCategory(tripId!, packingCategoryId),
    onSuccess: (_, packingCategoryId) => {
      toast.success(`"${getCategoryName(packingCategoryId) ?? 'Category'}" transferred to your checklist`);
      queryClient.invalidateQueries({ queryKey: checklistKeys.mine(tripId) });
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Transfer failed'),
  });
}
