import type { ChecklistCategory, ChecklistItem } from '../../../types';

export function getChecklistProgress(categories: ChecklistCategory[], uncategorized: ChecklistItem[]) {
  const all = [...categories.flatMap((category) => category.items), ...uncategorized];
  return { checked: all.filter((item) => item.isChecked).length, total: all.length };
}

export function sortUncheckedFirst(items: ChecklistItem[]) {
  return [...items].sort((a, b) => Number(a.isChecked) - Number(b.isChecked));
}
