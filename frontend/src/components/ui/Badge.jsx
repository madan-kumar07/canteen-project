import { cn } from '../../lib/utils';
import { getStatusColor } from '../../lib/utils';

export function Badge({ children, variant = 'default', dot = false, pulse = false, className = '' }) {
  const variants = {
    default:   'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
    brand:     'bg-brand-500/15 text-brand-600 dark:text-brand-400',
    success:   'bg-green-500/15 text-green-700 dark:text-green-400',
    warning:   'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    error:     'bg-red-500/15 text-red-700 dark:text-red-400',
    info:      'bg-blue-500/15 text-blue-700 dark:text-blue-400',
    veg:       'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30',
    nonveg:    'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
      variants[variant],
      className
    )}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          pulse && 'animate-pulse',
          variant === 'success' ? 'bg-green-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'error'   ? 'bg-red-500'   :
          variant === 'info'    ? 'bg-blue-500'  : 'bg-current'
        )} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const { bg, text, dot } = getStatusColor(status);
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', bg, text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot,
        ['Pending','Preparing','Ready'].includes(status) && 'animate-pulse'
      )} />
      {status}
    </span>
  );
}

export function VegBadge({ isVeg }) {
  return (
    <div
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      className={cn(
        'w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0',
        isVeg ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', isVeg ? 'bg-green-600' : 'bg-red-600')} />
    </div>
  );
}
