import { Card, CardBody } from '../../../components/ui/Card';
import type { PackingItem } from '../../../types';
import { ItemClaimRow } from './ItemClaimRow';
import { QuickAddInput } from './QuickAddInput';

interface UncategorizedSectionProps {
  tripId: string;
  items: PackingItem[];
  onEdit: (item: PackingItem) => void;
  onQuickAdd: (name: string) => void;
  onOpenFullAdd: () => void;
  isQuickAdding?: boolean;
}

export function UncategorizedSection({
  tripId,
  items,
  onEdit,
  onQuickAdd,
  onOpenFullAdd,
  isQuickAdding,
}: UncategorizedSectionProps) {
  if (items.length === 0) return null;

  return (
    <Card>
      <div className="w-full flex items-center px-4 pt-3 pb-2 text-left">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Other</span>
      </div>
      <CardBody className="py-0 px-4">
        {items.map((item) => (
          <ItemClaimRow key={item.id} item={item} tripId={tripId} onEdit={onEdit} />
        ))}
      </CardBody>
      <QuickAddInput onAdd={onQuickAdd} onOpenFull={onOpenFullAdd} isPending={isQuickAdding} />
    </Card>
  );
}
