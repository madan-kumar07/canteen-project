import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(function Input({
  label, error, hint, icon, iconRight,
  className = '', wrapClassName = '',
  ...props
}, ref) {
  return (
    <div className={cn('w-full', wrapClassName)}>
      {label && (
        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4 flex items-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm font-medium',
            'bg-surface-50 dark:bg-surface-800',
            'border border-surface-200 dark:border-surface-700',
            'text-surface-900 dark:text-surface-50 placeholder-surface-400 dark:placeholder-surface-500',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
            'transition-all duration-200',
            icon && 'pl-10',
            iconRight && 'pr-10',
            error && 'border-red-400 focus:ring-red-500/40 focus:border-red-500',
            className
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4 flex items-center">
            {iconRight}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-surface-400">{hint}</p>}
    </div>
  );
});

export function Textarea({ label, error, className = '', wrapClassName = '', ...props }) {
  return (
    <div className={cn('w-full', wrapClassName)}>
      {label && (
        <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-3 rounded-xl text-sm font-medium resize-none',
          'bg-surface-50 dark:bg-surface-800',
          'border border-surface-200 dark:border-surface-700',
          'text-surface-900 dark:text-surface-50 placeholder-surface-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
          'transition-all duration-200',
          error && 'border-red-400 focus:ring-red-500/40',
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
