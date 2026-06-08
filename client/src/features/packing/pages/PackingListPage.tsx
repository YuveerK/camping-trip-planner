import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/Modal';
import { PageLoader } from '../../../components/ui/LoadingSpinner';
import { TripLayout } from '../../../components/layout/TripLayout';
import { useAuth } from '../../../hooks/useAuth';
import type { PackingCategory, PackingItem } from '../../../types';
import { CategorySection } from '../components/CategorySection';
import { EmptyPackingState } from '../components/EmptyPackingState';
import { AddItemModal, EditItemModal } from '../components/PackingItemModals';
import { PackingTabs } from '../components/PackingTabs';
import { UncategorizedSection } from '../components/UncategorizedSection';
import {
  useDeletePackingCategory,
  useLoadPackingTemplate,
  usePackingCategories,
  usePackingItems,
  useQuickAddPackingItem,
  useTransferPackingCategoryToChecklist,
} from '../hooks/usePacking';
import { buildPackingTabs, getVisiblePackingItems } from '../utils/packingFilters';

export function PackingListPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddItem, setShowAddItem] = useState(false);
  const [addItemCategoryId, setAddItemCategoryId] = useState<string | undefined>();
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<PackingCategory | null>(null);
  const tab = searchParams.get('tab') ?? 'all';
  const { user } = useAuth();

  const { data: categoriesData, isLoading } = usePackingCategories(tripId);
  const { data: itemsData } = usePackingItems(tripId);

  const categories = categoriesData?.data ?? [];
  const allItems = itemsData?.data ?? [];

  const templateMut = useLoadPackingTemplate(tripId);
  const quickAddMut = useQuickAddPackingItem(tripId);
  const deleteCategoryMut = useDeletePackingCategory(tripId, () => setDeletingCategory(null));
  const transferMut = useTransferPackingCategoryToChecklist(
    tripId,
    (categoryId) => categories.find((category) => category.id === categoryId)?.name,
  );

  const isMyItem = (item: PackingItem) => item.claims.some((claim) => claim.member.userId === user?.id || claim.member.user?.id === user?.id);
  const visibleItems = getVisiblePackingItems(allItems, tab, isMyItem);
  const tabs = buildPackingTabs(allItems, isMyItem);
  const isEmpty = !isLoading && allItems.length === 0;
  const transferringCategoryId = transferMut.isPending ? transferMut.variables : undefined;
  const quickAddingCategoryId = quickAddMut.isPending ? quickAddMut.variables?.categoryId ?? null : undefined;
  const deletingCategoryId = deleteCategoryMut.isPending ? deleteCategoryMut.variables : undefined;

  function openFullAdd(categoryId?: string) {
    setAddItemCategoryId(categoryId);
    setShowAddItem(true);
  }

  return (
    <TripLayout>
      <div className="page-container pt-4">
        {!isEmpty && (
          <PackingTabs
            tabs={tabs}
            activeTab={tab}
            onSelect={(tabId) => setSearchParams(tabId === 'all' ? {} : { tab: tabId })}
            onAddItem={() => openFullAdd()}
          />
        )}

        {isLoading ? (
          <PageLoader />
        ) : isEmpty ? (
          <EmptyPackingState onLoadTemplate={() => templateMut.mutate()} onAddItem={() => openFullAdd()} isLoading={templateMut.isPending} />
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <CategorySection
                key={cat.id}
                cat={cat}
                tripId={tripId!}
                visibleItems={visibleItems}
                onEdit={setEditingItem}
                onAddItem={(name, catId) => quickAddMut.mutate({ name, categoryId: catId })}
                onOpenFullAdd={openFullAdd}
                onTransfer={(category) => transferMut.mutate(category.id)}
                onDelete={setDeletingCategory}
                isTransferring={transferringCategoryId === cat.id}
                isQuickAdding={quickAddingCategoryId === cat.id}
                isDeleting={deletingCategoryId === cat.id}
              />
            ))}
            <UncategorizedSection
              tripId={tripId!}
              items={visibleItems.filter((item) => !item.categoryId)}
              onEdit={setEditingItem}
              onQuickAdd={(name) => quickAddMut.mutate({ name })}
              onOpenFullAdd={() => openFullAdd()}
              isQuickAdding={quickAddingCategoryId === null}
            />
          </div>
        )}

        <AddItemModal open={showAddItem} onClose={() => { setShowAddItem(false); setAddItemCategoryId(undefined); }} tripId={tripId!} categories={categories} defaultCategoryId={addItemCategoryId} />
        {editingItem && <EditItemModal open={!!editingItem} onClose={() => setEditingItem(null)} tripId={tripId!} item={editingItem} categories={categories} />}
        <ConfirmModal
          open={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onConfirm={() => deletingCategory && deleteCategoryMut.mutate(deletingCategory.id)}
          loading={deleteCategoryMut.isPending}
          title="Delete category"
          message={`Delete "${deletingCategory?.name}" and all items in this category? This cannot be undone.`}
          confirmLabel="Delete category"
        />
      </div>
    </TripLayout>
  );
}
