import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: 'green' | 'earth' | 'blue' | 'red' | 'gray';
  sub?: string;
  onClick?: () => void;
}

const colorMap = {
  green: 'bg-forest-50 text-forest-600 border-forest-100',
  earth: 'bg-earth-50 text-earth-600 border-earth-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  gray: 'bg-stone-50 text-stone-600 border-stone-100',
};

export function StatCard({ label, value, icon, color = 'green', sub, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-2xl border shadow-card p-4 flex items-start gap-3',
        onClick && 'cursor-pointer hover:shadow-card-hover transition-shadow',
        'border-stone-200'
      )}
    >
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-xl border', colorMap[color])}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-stone-800 leading-none">{value}</div>
        <div className="text-xs text-stone-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
