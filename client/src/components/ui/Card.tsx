import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, hover, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      'bg-white rounded-2xl border border-stone-200 shadow-card',
      hover && 'hover:shadow-card-hover transition-shadow duration-200 cursor-pointer',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('p-4 border-b border-stone-100', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('p-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl', className)} {...props} />;
}
