import { clsx } from 'clsx';
import { getInitials } from '../../utils/format';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colors = [
  'bg-forest-500',
  'bg-earth-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center text-white font-semibold shrink-0',
        getColor(name),
        {
          'w-7 h-7 text-xs': size === 'sm',
          'w-9 h-9 text-sm': size === 'md',
          'w-12 h-12 text-base': size === 'lg',
        },
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
