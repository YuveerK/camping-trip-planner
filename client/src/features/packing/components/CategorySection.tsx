import { useState } from 'react';
import { clsx } from 'clsx';
import { Card, CardBody } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { PackingCategory, PackingItem } from '../../../types';
import { getTotalClaimed } from '../../../utils/format';
import { ItemClaimRow } from './ItemClaimRow';
import { QuickAddInput } from './QuickAddInput';

interface CategorySectionProps {
  cat: PackingCategory;
  tripId: string;
  visibleItems: PackingItem[];
  onEdit: (item: PackingItem) => void;
  onAddItem: (name: string, categoryId: string) => void;
  onOpenFullAdd: (categoryId: string) => void;
  onTransfer: (cat: PackingCategory) => void;
  onDelete: (cat: PackingCategory) => void;
  isTransferring?: boolean;
  isQuickAdding?: boolean;
  isDeleting?: boolean;
}

export function CategorySection({
  cat,
  tripId,
  visibleItems,
  onEdit,
  onAddItem,
  onOpenFullAdd,
  onTransfer,
  onDelete,
  isTransferring,
  isQuickAdding,
  isDeleting,
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const catItems = visibleItems.filter((item) => item.categoryId === cat.id);
  if (catItems.length === 0) return null;

  const totalClaimed = catItems.reduce((sum, item) => sum + getTotalClaimed(item.claims), 0);
  const totalNeeded = catItems.reduce((sum, item) => sum + item.requiredQuantity, 0);
  const allPacked = totalClaimed >= totalNeeded;

  return (
    <Card>
      <div className="flex items-center px-4 pt-3 pb-2 gap-2">
        <button onClick={() => setCollapsed((current) => !current)} className="flex flex-1 items-center gap-2 text-left min-w-0">
          <svg className={clsx('w-4 h-4 text-stone-400 transition-transform shrink-0', collapsed && '-rotate-90')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide truncate">{cat.name}</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className={clsx('text-xs font-medium tabular-nums', allPacked ? 'text-forest-600' : 'text-stone-400')}>
            {totalClaimed}/{totalNeeded} {allPacked && 'done'}
          </span>
          <div className="w-14 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className={clsx('h-full rounded-full transition-all', allPacked ? 'bg-forest-500' : 'bg-earth-400')} style={{ width: `${Math.min((totalClaimed / Math.max(totalNeeded, 1)) * 100, 100)}%` }} />
          </div>
        </div>
        <button
          onClick={() => onTransfer(cat)}
          disabled={isTransferring || isDeleting}
          title={isTransferring ? 'Transferring to my checklist' : 'Transfer to my checklist'}
          className="shrink-0 p-1.5 rounded-lg text-stone-300 hover:text-forest-600 hover:bg-forest-50 transition-colors disabled:cursor-wait disabled:text-forest-500"
        >
          {isTransferring ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          )}
        </button>
        <button
          onClick={() => onDelete(cat)}
          disabled={isDeleting || isTransferring}
          title={isDeleting ? 'Deleting category' : 'Delete category and all items'}
          className="shrink-0 p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:cursor-wait disabled:text-red-500"
        >
          {isDeleting ? (
            <LoadingSpinner size="sm" className="text-red-500" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 0 0 1-1h4a1 1 0 0 0 1 1m-7 0H5" />
            </svg>
          )}
        </button>
      </div>
      {!collapsed && (
        <>
          <CardBody className="py-0 px-4">
            {catItems.map((item) => (
              <ItemClaimRow key={item.id} item={item} tripId={tripId} onEdit={onEdit} />
            ))}
          </CardBody>
          <QuickAddInput onAdd={(name) => onAddItem(name, cat.id)} onOpenFull={() => onOpenFullAdd(cat.id)} isPending={isQuickAdding} />
        </>
      )}
    </Card>
  );
}
