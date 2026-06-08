import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { packingApi, type CreatePackingItemPayload } from '../../api/packing';
import { claimsApi } from '../../api/claims';
import { membersApi } from '../../api/members';
import { TripLayout } from '../../layouts/TripLayout';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';
import { getTotalClaimed, getMemberDisplayName } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import type { PackingItem, PackingCategory } from '../../types';
import { clsx } from 'clsx';

const PRIORITY_COLORS = { LOW: 'gray', MEDIUM: 'earth', HIGH: 'red' } as const;
const PRIORITY_ICONS = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' };

function ItemClaimRow({ item, tripId }: { item: PackingItem; tripId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [claimQty, setClaimQty] = useState(1);
  const [showClaim, setShowClaim] = useState(false);

  const totalClaimed = getTotalClaimed(item.claims);
  const remaining = item.requiredQuantity - totalClaimed;

  const { data: membersData } = useQuery({
    queryKey: ['members', tripId],
    queryFn: () => membersApi.getAll(tripId),
    enabled: showClaim,
  });

  const myMember = membersData?.data?.find((m) => m.userId === user?.id);
  const myClaim = item.claims.find((c) => c.member.userId === user?.id);

  const claimMutation = useMutation({
    mutationFn: () => claimsApi.create(item.id, { claimedQuantity: claimQty }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      toast.success('Item claimed!');
      setShowClaim(false);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to claim';
      toast.error(msg);
    },
  });

  const togglePackedMutation = useMutation({
    mutationFn: () => claimsApi.togglePacked(item.id, myClaim!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packing', tripId] }),
  });

  const unclaimMutation = useMutation({
    mutationFn: () => claimsApi.delete(item.id, myClaim!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      toast.success('Unclaimed');
    },
  });

  return (
    <div className="py-3 border-b border-stone-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-stone-800">{item.name}</span>
            <span className="text-xs">{PRIORITY_ICONS[item.priority]}</span>
            {item.isSharedItem && <Badge variant="blue">Shared</Badge>}
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

        {/* Actions */}
        <div className="shrink-0 flex flex-col gap-1">
          {myClaim ? (
            <>
              <Button
                size="sm"
                variant={myClaim.isPacked ? 'secondary' : 'primary'}
                onClick={() => togglePackedMutation.mutate()}
                loading={togglePackedMutation.isPending}
              >
                {myClaim.isPacked ? '✓ Packed' : 'Pack it'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => unclaimMutation.mutate()}
                loading={unclaimMutation.isPending}
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
          <Button size="sm" onClick={() => claimMutation.mutate()} loading={claimMutation.isPending}>
            Confirm
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowClaim(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}

function AddItemModal({
  open, onClose, tripId, categories
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  categories: PackingCategory[];
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePackingItemPayload>({
    defaultValues: { requiredQuantity: 1, priority: 'MEDIUM', isSharedItem: true },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreatePackingItemPayload) => packingApi.create(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packing', tripId] });
      toast.success('Item added!');
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add item';
      toast.error(msg);
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Add packing item">
      <form onSubmit={handleSubmit((d) => mutate(d))} className="flex flex-col gap-4">
        <Input label="Item name *" placeholder="e.g. Camping chairs" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Quantity needed" type="number" min={1} {...register('requiredQuantity', { valueAsNumber: true })} />
          <Input label="Unit" placeholder="e.g. chairs" {...register('unit')} />
        </div>
        <Select
          label="Category"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Select category"
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
          <input type="checkbox" id="isSharedItem" {...register('isSharedItem')} className="rounded" defaultChecked />
          <label htmlFor="isSharedItem" className="text-sm text-stone-600">Shared item (multiple people can claim)</label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
          <Button type="submit" loading={isPending} fullWidth>Add item</Button>
        </div>
      </form>
    </Modal>
  );
}

export function PackingListPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddItem, setShowAddItem] = useState(false);
  const tab = searchParams.get('tab') ?? 'all';

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['packing-categories', tripId],
    queryFn: () => packingApi.getCategories(tripId!),
  });

  const { data: itemsData } = useQuery({
    queryKey: ['packing', tripId],
    queryFn: () => packingApi.getAll(tripId!),
  });

  const { user } = useAuth();
  const categories = categoriesData?.data ?? [];
  const allItems = itemsData?.data ?? [];

  const visibleItems = tab === 'missing'
    ? allItems.filter((i) => getTotalClaimed(i.claims) < i.requiredQuantity)
    : tab === 'my-items'
    ? allItems.filter((i) => i.claims.some((c) => c.member.userId === user?.id))
    : allItems;

  const tabs = [
    { id: 'all', label: `All (${allItems.length})` },
    { id: 'missing', label: `Missing (${allItems.filter((i) => getTotalClaimed(i.claims) < i.requiredQuantity).length})` },
    { id: 'my-items', label: `Mine (${allItems.filter((i) => i.claims.some((c) => c.member.userId === user?.id)).length})` },
  ];

  return (
    <TripLayout>
      <div className="page-container pt-4">
        {/* Tab bar */}
        <div className="flex bg-stone-100 rounded-xl p-1 mb-4">
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
                        <CardHeader>
                          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{cat.name}</h3>
                        </CardHeader>
                        <CardBody className="py-0">
                          {catItems.map((item) => (
                            <ItemClaimRow key={item.id} item={item} tripId={tripId!} />
                          ))}
                        </CardBody>
                      </Card>
                    );
                  })}

                {/* Uncategorised items */}
                {(() => {
                  const uncatItems = visibleItems.filter((i) => !i.categoryId);
                  if (uncatItems.length === 0) return null;
                  return (
                    <Card>
                      <CardHeader>
                        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Other</h3>
                      </CardHeader>
                      <CardBody className="py-0">
                        {uncatItems.map((item) => (
                          <ItemClaimRow key={item.id} item={item} tripId={tripId!} />
                        ))}
                      </CardBody>
                    </Card>
                  );
                })()}
              </div>
            )}

            {tab === 'all' && (
              <div className="mt-4">
                <Button fullWidth variant="secondary" onClick={() => setShowAddItem(true)}>
                  + Add item
                </Button>
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
      </div>
    </TripLayout>
  );
}
