import { clsx } from 'clsx';
import { Button } from '../../../components/ui/Button';

interface PackingTab {
  id: string;
  label: string;
}

interface PackingTabsProps {
  tabs: PackingTab[];
  activeTab: string;
  onSelect: (tabId: string) => void;
  onAddItem: () => void;
}

export function PackingTabs({ tabs, activeTab, onSelect, onAddItem }: PackingTabsProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex flex-1 bg-stone-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={clsx(
              'flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors',
              activeTab === tab.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Button onClick={onAddItem} size="sm">+ Add item</Button>
    </div>
  );
}
