import { Button } from '../../../components/ui/Button';

interface EmptyPackingStateProps {
  onLoadTemplate: () => void;
  onAddItem: () => void;
  isLoading: boolean;
}

export function EmptyPackingState({ onLoadTemplate, onAddItem, isLoading }: EmptyPackingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">Backpack</div>
      <h3 className="text-base font-semibold text-stone-700 mb-1">No items yet</h3>
      <p className="text-sm text-stone-400 mb-8 max-w-xs">
        Start from a camping template with 10 pre-built categories and 80+ common items, or build your list from scratch.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button onClick={onLoadTemplate} loading={isLoading} fullWidth>
          Load camping template
        </Button>
        <Button onClick={onAddItem} variant="secondary" fullWidth>
          Start from scratch
        </Button>
      </div>
      <p className="text-xs text-stone-400 mt-4">You can delete or edit any template items after loading</p>
    </div>
  );
}
