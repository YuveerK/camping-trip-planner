import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Modal } from '../../../components/ui/Modal';
import type { PackingCategory, PackingItem } from '../../../types';
import { packingKeys } from '../hooks/usePacking';
import { packingApi, type CreatePackingItemPayload } from '../services/packingApi';
import { PackingItemForm } from './PackingItemForm';

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  categories: PackingCategory[];
  defaultCategoryId?: string;
}

export function AddItemModal({ open, onClose, tripId, categories, defaultCategoryId }: AddItemModalProps) {
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreatePackingItemPayload) => packingApi.create(tripId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: packingKeys.items(tripId) });
      qc.invalidateQueries({ queryKey: packingKeys.categories(tripId) });
      toast.success('Item added!');
      onClose();
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add item'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Add packing item">
      <PackingItemForm defaultValues={{ categoryId: defaultCategoryId ?? '' }} categories={categories} onSubmit={mutate} isPending={isPending} onCancel={onClose} submitLabel="Add item" />
    </Modal>
  );
}

interface EditItemModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  item: PackingItem;
  categories: PackingCategory[];
}

export function EditItemModal({ open, onClose, tripId, item, categories }: EditItemModalProps) {
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<CreatePackingItemPayload>) => packingApi.update(tripId, item.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: packingKeys.items(tripId) });
      qc.invalidateQueries({ queryKey: packingKeys.categories(tripId) });
      toast.success('Item updated');
      onClose();
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update item'),
  });

  return (
    <Modal open={open} onClose={onClose} title={`Edit "${item.name}"`}>
      <PackingItemForm
        defaultValues={{
          name: item.name,
          description: item.description ?? '',
          categoryId: item.categoryId ?? '',
          requiredQuantity: item.requiredQuantity,
          unit: item.unit ?? '',
          priority: item.priority,
          isSharedItem: item.isSharedItem,
        }}
        categories={categories}
        onSubmit={mutate}
        isPending={isPending}
        onCancel={onClose}
        submitLabel="Save changes"
      />
    </Modal>
  );
}
