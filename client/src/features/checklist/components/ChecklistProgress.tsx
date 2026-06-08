export function ChecklistProgress({ checked, total }: { checked: number; total: number }) {
  if (total === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="flex justify-between text-sm font-medium text-stone-700 mb-2">
        <span>Progress</span>
        <span>{checked}/{total} packed</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-forest-500 rounded-full transition-all duration-300" style={{ width: `${(checked / total) * 100}%` }} />
      </div>
      {checked === total && (
        <p className="text-xs text-forest-600 font-medium mt-2 text-center">All packed. You are ready.</p>
      )}
    </div>
  );
}
