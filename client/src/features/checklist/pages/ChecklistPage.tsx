import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripLayout } from '../../../components/layout/TripLayout';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { useAuth } from '../../../hooks/useAuth';
import { useTrip } from '../../trips/hooks/useTrips';
import { AddCategorySection } from '../components/AddCategorySection';
import { ChecklistCategorySection } from '../components/ChecklistCategorySection';
import { ChecklistHeader } from '../components/ChecklistHeader';
import { ChecklistProgress } from '../components/ChecklistProgress';
import { ReadOnlyChecklist } from '../components/ReadOnlyChecklist';
import { UncategorizedChecklist } from '../components/UncategorizedChecklist';
import { useChecklist, useChecklistMutations, useOwnerChecklist } from '../hooks/useChecklist';
import { getChecklistProgress, sortUncheckedFirst } from '../utils/checklistProgress';

export function ChecklistPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const { data: tripData } = useTrip(tripId);
  const trip = tripData?.data;
  const myMember = trip?.members.find((member) => member.user?.id === user?.id);
  const isOwner = myMember?.role === 'OWNER';
  const checklistIsPublic = myMember?.checklistIsPublic ?? false;

  const { data: myData, isLoading } = useChecklist(tripId);
  const categories = myData?.data?.categories ?? [];
  const uncategorized = myData?.data?.uncategorized ?? [];

  const { data: ownerData } = useOwnerChecklist(tripId, !isOwner);
  const ownerChecklist = ownerData?.data;

  const {
    addCategory: addCategoryMut,
    renameCategory: renameCategoryMut,
    deleteCategory: deleteCategoryMut,
    addItem: addItemMut,
    toggleItem: toggleMut,
    renameItem: renameMut,
    deleteItem: deleteItemMut,
    setVisibility: visibilityMut,
  } = useChecklistMutations(tripId, {
    checklistIsPublic,
    onCategoryCreated: () => {
      setNewCategoryName('');
      setAddingCategory(false);
    },
  });

  const { checked, total } = getChecklistProgress(categories, uncategorized);
  const sortedUncategorized = sortUncheckedFirst(uncategorized);
  const pendingToggleItemId = toggleMut.isPending ? toggleMut.variables?.id : undefined;
  const pendingRenameItemId = renameMut.isPending ? renameMut.variables?.id : undefined;
  const pendingDeleteItemId = deleteItemMut.isPending ? deleteItemMut.variables : undefined;
  const pendingAddItemCategoryId = addItemMut.isPending ? addItemMut.variables?.categoryId ?? null : undefined;
  const pendingRenameCategoryId = renameCategoryMut.isPending ? renameCategoryMut.variables?.id : undefined;
  const pendingDeleteCategoryId = deleteCategoryMut.isPending ? deleteCategoryMut.variables : undefined;

  function submitCategory() {
    const name = newCategoryName.trim();
    if (name) addCategoryMut.mutate(name);
    else setAddingCategory(false);
  }

  function cancelCategory() {
    setNewCategoryName('');
    setAddingCategory(false);
  }

  return (
    <TripLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <ChecklistHeader
          isOwner={isOwner}
          isPublic={checklistIsPublic}
          isPending={visibilityMut.isPending}
          onTogglePublic={() => visibilityMut.mutate(!checklistIsPublic)}
        />
        <ChecklistProgress checked={checked} total={total} />

        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : (
          <>
            {categories.map((category) => (
              <ChecklistCategorySection
                key={category.id}
                category={category}
                onToggle={(id, isChecked) => toggleMut.mutate({ id, isChecked })}
                onRenameItem={(id, text) => renameMut.mutate({ id, text })}
                onDeleteItem={(id) => deleteItemMut.mutate(id)}
                onAddItem={(categoryId, text) => addItemMut.mutate({ text, categoryId })}
                onRenameCategory={(id, name) => renameCategoryMut.mutate({ id, name })}
                onDeleteCategory={(id) => deleteCategoryMut.mutate(id)}
                pendingToggleItemId={pendingToggleItemId}
                pendingRenameItemId={pendingRenameItemId}
                pendingDeleteItemId={pendingDeleteItemId}
                isAddingItem={pendingAddItemCategoryId === category.id}
                isRenamingCategory={pendingRenameCategoryId === category.id}
                isDeletingCategory={pendingDeleteCategoryId === category.id}
              />
            ))}

            <UncategorizedChecklist
              categoriesCount={categories.length}
              items={sortedUncategorized}
              onToggle={(id, isChecked) => toggleMut.mutate({ id, isChecked })}
              onRename={(id, text) => renameMut.mutate({ id, text })}
              onDelete={(id) => deleteItemMut.mutate(id)}
              onAdd={(text) => addItemMut.mutate({ text, categoryId: null })}
              pendingToggleItemId={pendingToggleItemId}
              pendingRenameItemId={pendingRenameItemId}
              pendingDeleteItemId={pendingDeleteItemId}
              isAddingItem={pendingAddItemCategoryId === null}
            />

            <AddCategorySection
              isAdding={addingCategory}
              value={newCategoryName}
              onChange={setNewCategoryName}
              onSubmit={submitCategory}
              onCancel={cancelCategory}
              onStart={() => setAddingCategory(true)}
              isPending={addCategoryMut.isPending}
            />
          </>
        )}

        <ReadOnlyChecklist checklist={ownerChecklist} isOwner={isOwner} />
      </div>
    </TripLayout>
  );
}
