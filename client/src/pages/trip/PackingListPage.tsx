import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { packingApi, type CreatePackingItemPayload } from '../../api/packing';
import { claimsApi } from '../../api/claims';
import { membersApi } from '../../api/members';
import { TripLayout } from '../../layouts/TripLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { getTotalClaimed, getMemberDisplayName } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import type { PackingItem, PackingCategory } from '../../types';
import { clsx } from 'clsx';

const PRIORITY_ICONS = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' };

// ── Item form (shared by Add and Edit modals) ─────────────────────────────────

function ItemForm({
  defaultValues,
  categories,
  onSubmit,
  isPending,
  onCancel,
  submitLabel,
}: {
  defaultValues: Partial<CreatePackingItemPayload>;
  categories: PackingCategory[];
  onSubmit: (data: CreatePackingItemPayload) => void;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePackingItemPayload>({
    defaultValues: { requiredQuantity: 1, priority: 'MEDIUM', isSharedItem: true, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Item name *"
        placeholder="e.g. Camping chairs"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Quantity needed" type="number" min={1} {...register('requiredQuantity', { valueAsNumber: true })} />
        <Input label="Unit" placeholder="e.g. chairs" {...register('unit')} />
      </div>
      <Select
        label="Category"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="No category"
        {...register('categoryId')}
      />
      <Select
        label="Priority"
        options={[
          { value: 'LOW', label: '🟢 Low' },
          { value: 'MEDIUM', label: '🟡 Medium' },
          { value: 'HIGH', label: '🔴 High' },
        ]}
        {...register('priority')}
      />
      <Textarea label="Description (optional)" placeholder="Any details..." {...register('description')} />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isSharedItem" {...register('isSharedItem')} className="rounded" />
        <label htmlFor="isSharedItem" className="text-sm text-stone-600">
          Shared item (multiple people can claim)
        </label>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>Cancel</Button>
        <Button type="submit" loading={isPending} fullWidth>{submitLabel}</Button>
      </div>
    </form>
  );
}

// ── Add item modal ────────────────────────────────────────────────────────────

function AddItemModal({ open, onClose, tripId, categories }: {
  open: boolean; onClose: () => void; tripId: string; categories: PackingCategory[];
}) {
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreatePackingItemPayload) => packingApi.create(tripId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packing', tripId] });
      toast.success('Item added!');
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add item';
      toast.error(msg);
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Add packing item">
      <ItemForm
        defaultValues={{}}
        categories={categories}
        onSubmit={mutate}
        isPending={isPending}
        onCancel={onClose}
        submitLabel="Add item"
      />
    </Modal>
  );
}

// ── Edit item modal ───────────────────────────────────────────────────────────

function EditItemModal({ open, onClose, tripId, item, categories }: {
  open: boolean; onClose: () => void; tripId: string; item: PackingItem; categories: PackingCategory[];
}) {
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<CreatePackingItemPayload>) => packingApi.update(tripId, item.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packing', tripId] });
      toast.success('Item updated');
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update item';
      toast.error(msg);
    },
  });

  return (
    <Modal open={open} onClose={onClose} title={`Edit "${item.name}"`}>
      <ItemForm
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

// ── Item row ──────────────────────────────────────────────────────────────────

function ItemClaimRow({ item, tripId, onEdit }: {
  item: PackingItem; tripId: string; onEdit: (item: PackingItem) => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [claimQty, setClaimQty] = useState(1);
  const [showClaim, setShowClaim] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalClaimed = getTotalClaimed(item.claims);
  const remaining = item.requiredQuantity - totalClaimed;

  const { data: membersData } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => membersApi.getAll(tripId),
    enabled: showClaim,
  });
  void membersData;

  const myMember = item.claims.find((c) => c.member.userId === user?.id || c.member.user?.id === user?.id);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['packing', tripId] });

  const claimMut = useMutation({
    mutationFn: () => claimsApi.create(item.id, { claimedQuantity: claimQty }),
    onSuccess: () => { invalidate(); toast.success('Item claimed!'); setShowClaim(false); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to claim';
      toast.error(msg);
    },
  });

  const togglePackedMut = useMutation({
    mutationFn: () => claimsApi.togglePacked(item.id, myMember!.id),
    onSuccess: invalidate,
  });

  const unclaimMut = useMutation({
    mutationFn: () => claimsApi.delete(item.id, myMember!.id),
    onSuccess: () => { invalidate(); toast.success('Unclaimed'); },
  });

  const deleteMut = useMutation({
    mutationFn: () => packingApi.delete(tripId, item.id),
    onSuccess: () => { invalidate(); toast.success('Item removed'); },
    onError: () => toast.error('Failed to delete item'),
  });

  return (
    <div className="py-3 border-b border-stone-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Name row with edit/delete on hover */}
          <div className="flex items-center gap-2 flex-wrap group/name">
            <span className="text-sm font-medium text-stone-800">{item.name}</span>
            <span className="text-xs">{PRIORITY_ICONS[item.priority]}</span>
            {item.isSharedItem && <Badge variant="blue">Shared</Badge>}

            {/* Edit / delete controls */}
            <div className="flex items-center gap-1 opacity-0 group-hover/name:opacity-100 transition-opacity ml-1">
              <button
                onClick={() => onEdit(item)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                title="Edit item"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.586-.626z" />
                </svg>
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete item"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1h4a1 1 0 001 1m-7 0H5" />
                  </svg>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => deleteMut.mutate()}
                    disabled={deleteMut.isPending}
                    className="px-1.5 py-0.5 rounded bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-1.5 py-0.5 rounded text-stone-500 hover:text-stone-700 text-xs"
                  >
                    Cancel
                  </button>
                </span>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
          )}

          {/* Claim progress */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>{totalClaimed}/{item.requiredQuantity} {item.unit ?? 'needed'}</span>
              <span className={clsx(remaining > 0 ? 'text-red-500' : 'text-forest-600')}>
                {remaining > 0 ? `${remaining} more needed` : 'Fully claimed ✓'}
              </span>
            </div>
            <ProgressBar value={totalClaimed} max={item.requiredQuantity} color={remaining > 0 ? 'earth' : 'green'} />
          </div>

          {/* Who's bringing what */}
          {item.claims.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.claims.map((claim) => (
                <div
                  key={claim.id}
                  className={clsx(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                    claim.isPacked ? 'bg-forest-100 text-forest-700' : 'bg-stone-100 text-stone-600'
                  )}
                >
                  <span>{claim.isPacked ? '✅' : '⬜'}</span>
                  <span>{getMemberDisplayName(claim.member)}</span>
                  <span className="font-medium">×{claim.claimedQuantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claim / pack / unclaim actions */}
        <div className="shrink-0 flex flex-col gap-1">
          {myMember ? (
            <>
              <Button
                size="sm"
                variant={myMember.isPacked ? 'secondary' : 'primary'}
                onClick={() => togglePackedMut.mutate()}
                loading={togglePackedMut.isPending}
              >
                {myMember.isPacked ? '✓ Packed' : 'Pack it'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => unclaimMut.mutate()}
                loading={unclaimMut.isPending}
              >
                Unclaim
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant={remaining <= 0 ? 'secondary' : 'primary'}
              onClick={() => setShowClaim(true)}
            >
              {remaining <= 0 ? 'Claim extra' : 'Claim'}
            </Button>
          )}
        </div>
      </div>

      {/* Claim quantity input */}
      {showClaim && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
          <span className="text-sm text-stone-600 shrink-0">Bringing:</span>
          <input
            type="number"
            min={1}
            max={Math.max(remaining, 10)}
            value={claimQty}
            onChange={(e) => setClaimQty(parseInt(e.target.value) || 1)}
            className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-sm text-center"
          />
          <span className="text-sm text-stone-500">{item.unit ?? 'units'}</span>
          <Button size="sm" onClick={() => claimMut.mutate()} loading={claimMut.isPending}>Confirm</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowClaim(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function PackingListPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const tab = searchParams.get('tab') ?? 'all';
  const { user } = useAuth();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['packing-categories', tripId],
    queryFn: () => packingApi.getCategories(tripId!),
  });

  const { data: itemsData } = useQuery({
    queryKey: ['packing', tripId],
    queryFn: () => packingApi.getAll(tripId!),
  });

  const categories = categoriesData?.data ?? [];
  const allItems = itemsData?.data ?? [];

  const visibleItems = tab === 'missing'
    ? allItems.filter((i) => getTotalClaimed(i.claims) < i.requiredQuantity)
    : tab === 'my-items'
    ? allItems.filter((i) => i.claims.some((c) => c.member.userId === user?.id || c.member.user?.id === user?.id))
    : allItems;

  const tabs = [
    { id: 'all', label: `All (${allItems.length})` },
    { id: 'missing', label: `Missing (${allItems.filter((i) => getTotalClaimed(i.claims) < i.requiredQuantity).length})` },
    { id: 'my-items', label: `Mine (${allItems.filter((i) => i.claims.some((c) => c.member.userId === user?.id || c.member.user?.id === user?.id)).length})` },
  ];

  return (
    <TripLayout>
      <div className="page-container pt-4">
        {/* Tab bar + add button */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex flex-1 bg-stone-100 rounded-xl p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setSearchParams(t.id === 'all' ? {} : { tab: t.id })}
                className={clsx(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  tab === t.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowAddItem(true)} size="sm">
            + Add item
          </Button>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : (
          <>
            {visibleItems.length === 0 ? (
              <EmptyState
                icon={tab === 'missing' ? '🎉' : tab === 'my-items' ? '🙋' : '🎒'}
                title={tab === 'missing' ? 'Everything is claimed!' : tab === 'my-items' ? 'Nothing claimed yet' : 'No items yet'}
                description={tab === 'all' ? 'Add items to the packing list so everyone knows what to bring' : undefined}
                action={tab === 'all' ? <Button onClick={() => setShowAddItem(true)}>Add first item</Button> : undefined}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {categories
                  .filter((cat) => visibleItems.some((i) => i.categoryId === cat.id))
                  .map((cat) => {
                    const catItems = visibleItems.filter((i) => i.categoryId === cat.id);
                    if (catItems.length === 0) return null;
                    return (
                      <Card key={cat.id}>
                        <div className="px-4 pt-3 pb-1">
                          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{cat.name}</h3>
                        </div>
                        <CardBody className="py-0">
                          {catItems.map((item) => (
                            <ItemClaimRow
                              key={item.id}
                              item={item}
                              tripId={tripId!}
                              onEdit={setEditingItem}
                            />
                          ))}
                        </CardBody>
                      </Card>
                    );
                  })}

                {/* Uncategorised */}
                {(() => {
                  const uncatItems = visibleItems.filter((i) => !i.categoryId);
                  if (uncatItems.length === 0) return null;
                  return (
                    <Card>
                      <div className="px-4 pt-3 pb-1">
                        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Other</h3>
                      </div>
                      <CardBody className="py-0">
                        {uncatItems.map((item) => (
                          <ItemClaimRow
                            key={item.id}
                            item={item}
                            tripId={tripId!}
                            onEdit={setEditingItem}
                          />
                        ))}
                      </CardBody>
                    </Card>
                  );
                })()}
              </div>
            )}

          </>
        )}

        <AddItemModal
          open={showAddItem}
          onClose={() => setShowAddItem(false)}
          tripId={tripId!}
          categories={categories}
        />

        {editingItem && (
          <EditItemModal
            open={!!editingItem}
            onClose={() => setEditingItem(null)}
            tripId={tripId!}
            item={editingItem}
            categories={categories}
          />
        )}
      </div>
    </TripLayout>
  );
}
