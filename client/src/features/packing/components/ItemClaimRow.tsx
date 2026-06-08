import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { useAuth } from '../../../hooks/useAuth';
import type { ApiResponse, ItemClaim, PackingCategory, PackingItem } from '../../../types';
import { getMemberDisplayName, getTotalClaimed } from '../../../utils/format';
import { packingKeys } from '../hooks/usePacking';
import { claimsApi } from '../services/claimsApi';
import { packingApi } from '../services/packingApi';

const PRIORITY_LABELS = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

interface ItemClaimRowProps {
  item: PackingItem;
  tripId: string;
  onEdit: (item: PackingItem) => void;
}

// Updates the claims array of a single item in both the flat-items and
// nested-categories caches so both stay in sync without a refetch.
function updateItemClaims(
  qc: ReturnType<typeof useQueryClient>,
  tripId: string,
  itemId: string,
  updater: (claims: ItemClaim[]) => ItemClaim[],
) {
  qc.setQueryData<ApiResponse<PackingItem[]>>(
    packingKeys.items(tripId),
    (old) => old ? { ...old, data: old.data.map((i) => i.id === itemId ? { ...i, claims: updater(i.claims) } : i) } : old,
  );
  qc.setQueryData<ApiResponse<PackingCategory[]>>(
    packingKeys.categories(tripId),
    (old) => old ? {
      ...old,
      data: old.data.map((cat) => ({
        ...cat,
        items: cat.items?.map((i) => i.id === itemId ? { ...i, claims: updater(i.claims) } : i) ?? [],
      })),
    } : old,
  );
}

export function ItemClaimRow({ item, tripId, onEdit }: ItemClaimRowProps) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [claimQty, setClaimQty] = useState(1);
  const [showClaim, setShowClaim] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalClaimed = getTotalClaimed(item.claims);
  const remaining = item.requiredQuantity - totalClaimed;
  const myMember = item.claims.find((claim) => claim.member.userId === user?.id || claim.member.user?.id === user?.id);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: packingKeys.items(tripId) });
    qc.invalidateQueries({ queryKey: packingKeys.categories(tripId) });
  };

  const snapshot = () => ({
    prevItems: qc.getQueryData(packingKeys.items(tripId)),
    prevCats: qc.getQueryData(packingKeys.categories(tripId)),
  });

  const rollback = (context: { prevItems: unknown; prevCats: unknown } | undefined) => {
    if (context?.prevItems) qc.setQueryData(packingKeys.items(tripId), context.prevItems);
    if (context?.prevCats) qc.setQueryData(packingKeys.categories(tripId), context.prevCats);
  };

  // Claim — uses server response to update cache (can't predict the new claim's ID)
  const claimMut = useMutation({
    mutationFn: () => claimsApi.create(item.id, { claimedQuantity: claimQty }),
    onSuccess: (data) => {
      updateItemClaims(qc, tripId, item.id, (claims) => [...claims, data.data]);
      toast.success('Item claimed!');
      setShowClaim(false);
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to claim'),
    onSettled: invalidate,
  });

  // Toggle packed — optimistic: flip isPacked immediately
  const togglePackedMut = useMutation({
    mutationFn: () => claimsApi.togglePacked(item.id, myMember!.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: packingKeys.items(tripId) });
      await qc.cancelQueries({ queryKey: packingKeys.categories(tripId) });
      const ctx = snapshot();
      updateItemClaims(qc, tripId, item.id, (claims) =>
        claims.map((c) => c.id === myMember!.id ? { ...c, isPacked: !c.isPacked } : c),
      );
      return ctx;
    },
    onError: (_, __, context) => rollback(context),
    onSettled: invalidate,
  });

  // Unclaim — optimistic: remove claim immediately
  const unclaimMut = useMutation({
    mutationFn: () => claimsApi.delete(item.id, myMember!.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: packingKeys.items(tripId) });
      await qc.cancelQueries({ queryKey: packingKeys.categories(tripId) });
      const ctx = snapshot();
      updateItemClaims(qc, tripId, item.id, (claims) => claims.filter((c) => c.id !== myMember!.id));
      return ctx;
    },
    onError: (_, __, context) => { rollback(context); toast.error('Failed to unclaim'); },
    onSuccess: () => toast.success('Unclaimed'),
    onSettled: invalidate,
  });

  // Delete item — optimistic: remove item from both caches immediately
  const deleteMut = useMutation({
    mutationFn: () => packingApi.delete(tripId, item.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: packingKeys.items(tripId) });
      await qc.cancelQueries({ queryKey: packingKeys.categories(tripId) });
      const ctx = snapshot();
      qc.setQueryData<ApiResponse<PackingItem[]>>(
        packingKeys.items(tripId),
        (old) => old ? { ...old, data: old.data.filter((i) => i.id !== item.id) } : old,
      );
      qc.setQueryData<ApiResponse<PackingCategory[]>>(
        packingKeys.categories(tripId),
        (old) => old ? {
          ...old,
          data: old.data.map((cat) => ({ ...cat, items: cat.items?.filter((i) => i.id !== item.id) ?? [] })),
        } : old,
      );
      return ctx;
    },
    onError: (_, __, context) => { rollback(context); toast.error('Failed to delete item'); },
    onSuccess: () => toast.success('Item removed'),
    onSettled: invalidate,
  });

  return (
    <div className="py-3 border-b border-stone-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap group/name">
            <span className="text-sm font-medium text-stone-800">{item.name}</span>
            <span className="text-xs text-stone-400">{PRIORITY_LABELS[item.priority]}</span>
            {item.isSharedItem && <Badge variant="blue">Shared</Badge>}
            <div className="flex items-center gap-1 opacity-0 group-hover/name:opacity-100 transition-opacity">
              <button onClick={() => onEdit(item)} className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors" title="Edit">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.586-.626z" /></svg>
              </button>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1h4a1 1 0 001 1m-7 0H5" /></svg>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs">
                  <button onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:cursor-wait disabled:opacity-70">
                    {deleteMut.isPending && <LoadingSpinner size="sm" className="text-white" />}
                    Delete
                  </button>
                  <button onClick={() => setConfirmDelete(false)} disabled={deleteMut.isPending} className="px-1.5 py-0.5 rounded text-stone-500 hover:text-stone-700 text-xs disabled:opacity-50">Cancel</button>
                </span>
              )}
            </div>
          </div>
          {item.description && <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>{totalClaimed}/{item.requiredQuantity} {item.unit ?? 'needed'}</span>
              <span className={clsx(remaining > 0 ? 'text-red-500' : 'text-forest-600')}>{remaining > 0 ? `${remaining} more needed` : 'Fully claimed'}</span>
            </div>
            <ProgressBar value={totalClaimed} max={item.requiredQuantity} color={remaining > 0 ? 'earth' : 'green'} />
          </div>
          {item.claims.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.claims.map((claim) => (
                <div key={claim.id} className={clsx('flex items-center gap-1 text-xs px-2 py-1 rounded-full', claim.isPacked ? 'bg-forest-100 text-forest-700' : 'bg-stone-100 text-stone-600')}>
                  <span>{claim.isPacked ? 'Packed' : 'Open'}</span>
                  <span>{getMemberDisplayName(claim.member)}</span>
                  <span className="font-medium">x{claim.claimedQuantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col gap-1">
          {myMember ? (
            <>
              <Button size="sm" variant={myMember.isPacked ? 'secondary' : 'primary'} onClick={() => togglePackedMut.mutate()} loading={togglePackedMut.isPending}>{myMember.isPacked ? 'Packed' : 'Pack it'}</Button>
              <Button size="sm" variant="ghost" onClick={() => unclaimMut.mutate()} loading={unclaimMut.isPending}>Unclaim</Button>
            </>
          ) : (
            <Button size="sm" variant={remaining <= 0 ? 'secondary' : 'primary'} onClick={() => setShowClaim(true)}>{remaining <= 0 ? 'Claim extra' : 'Claim'}</Button>
          )}
        </div>
      </div>
      {showClaim && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
          <span className="text-sm text-stone-600 shrink-0">Bringing:</span>
          <input type="number" min={1} max={Math.max(remaining, 10)} value={claimQty} onChange={(event) => setClaimQty(parseInt(event.target.value) || 1)} className="w-16 border border-stone-200 rounded-lg px-2 py-1 text-sm text-center" />
          <span className="text-sm text-stone-500">{item.unit ?? 'units'}</span>
          <Button size="sm" onClick={() => claimMut.mutate()} loading={claimMut.isPending}>Confirm</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowClaim(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
