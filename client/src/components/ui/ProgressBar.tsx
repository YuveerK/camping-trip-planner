import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  color?: 'green' | 'earth' | 'red' | 'blue';
}

const colorMap = {
  green: 'bg-forest-500',
  earth: 'bg-earth-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export function ProgressBar({ value, max, className, showLabel, size = 'sm', color = 'green' }: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('w-full bg-stone-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500', colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-stone-500">
          <span>{value} / {max}</span>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  );
}
