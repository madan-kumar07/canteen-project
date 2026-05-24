import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  icon, iconRight, className = '',
  onClick, type = 'button', ...props
}) {
  const variants = {
    primary:   'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-sm hover:shadow-brand',
    secondary: 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-100',
    ghost:     'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400',
    outline:   'border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300',
    danger:    'bg-red-500 hover:bg-red-600 text-white',
    success:   'bg-green-500 hover:bg-green-600 text-white',
    brand:     'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-brand hover:shadow-brand',
  };
  const sizes = {
    xs: 'px-3 py-1.5 text-xs rounded-lg',
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3.5 text-base rounded-2xl',
    xl: 'px-8 py-4 text-lg rounded-2xl',
    icon: 'p-2.5 rounded-xl',
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-all duration-200 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
        </svg>
      ) : icon ? (
        <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="w-4 h-4 flex-shrink-0">{iconRight}</span>}
    </motion.button>
  );
}
