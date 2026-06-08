import { clsx } from 'clsx';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'earth';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  green: 'bg-forest-100 text-forest-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-stone-100 text-stone-600',
  orange: 'bg-orange-100 text-orange-700',
  earth: 'bg-earth-100 text-earth-700',
};

export function Badge({ variant = 'gray', className, children }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
