import type { PackingItem } from '../../../types';
import { getTotalClaimed } from '../../../utils/format';

export function getVisiblePackingItems(
  allItems: PackingItem[],
  tab: string,
  isMyItem: (item: PackingItem) => boolean,
) {
  if (tab === 'missing') {
    return allItems.filter((item) => getTotalClaimed(item.claims) < item.requiredQuantity);
  }
  if (tab === 'my-items') return allItems.filter(isMyItem);
  return allItems;
}

export function buildPackingTabs(allItems: PackingItem[], isMyItem: (item: PackingItem) => boolean) {
  return [
    { id: 'all', label: `All (${allItems.length})` },
    { id: 'missing', label: `Missing (${allItems.filter((item) => getTotalClaimed(item.claims) < item.requiredQuantity).length})` },
    { id: 'my-items', label: `Mine (${allItems.filter(isMyItem).length})` },
  ];
}
