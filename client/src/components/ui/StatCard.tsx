import { clsx } from 'clsx';
import type { SVGProps } from 'react';

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

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const iconMap: Record<string, IconComponent> = {
  Bag: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 8V6a4 4 0 0 1 8 0v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l-1 12H6L5 8Z" />
    </svg>
  ),
  Missing: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.9 2.6 18.1A2 2 0 0 0 4.3 21h15.4a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  ),
  Packed: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
    </svg>
  ),
  Tasks: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 6 1 1 2-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 12 1 1 2-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 18 1 1 2-2" />
    </svg>
  ),
  Meals: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 3v8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11v10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 3c-2 2-3 4-3 7v4h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 3v18" />
    </svg>
  ),
  Money: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10H3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7a3 3 0 0 1-3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 10a3 3 0 0 1-3-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14a3 3 0 0 1 3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17a3 3 0 0 1 3-3" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
};

export function StatCard({ label, value, icon, color = 'green', sub, onClick }: StatCardProps) {
  const Icon = iconMap[icon];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-2xl border shadow-card p-4 flex items-center gap-4 min-h-20 overflow-hidden',
        onClick && 'cursor-pointer hover:shadow-card-hover transition-shadow',
        'border-stone-200'
      )}
    >
      <div className={clsx('w-11 h-11 rounded-xl flex shrink-0 items-center justify-center border', colorMap[color])}>
        {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : <span className="text-sm font-semibold">{icon.slice(0, 1)}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-2xl font-bold text-stone-800 leading-none">{value}</div>
        <div className="truncate text-xs text-stone-500 mt-1">{label}</div>
        {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
