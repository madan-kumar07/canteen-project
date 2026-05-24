import { cn } from '../../lib/utils';

export function Card({ children, className = '', hover = false, glass = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-surface-900',
        'border border-surface-100 dark:border-surface-800',
        'rounded-2xl',
        'transition-all duration-200',
        hover && 'hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer',
        glass && 'bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl',
        onClick && !hover && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'bg-white/10 dark:bg-black/20 backdrop-blur-xl',
        'border border-white/20 dark:border-white/10',
        'rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
