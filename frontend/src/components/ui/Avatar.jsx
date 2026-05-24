import { cn, getInitials } from '../../lib/utils';
import { getAvatarColor, AVATAR_COLORS } from '../../lib/constants';

export function Avatar({ name = '', size = 'md', className = '', colorOverride, imageSrc }) {
  const initials = getInitials(name);
  const gradient = colorOverride || getAvatarColor(name);
  const sizes = {
    xs:  'w-6  h-6  text-xs',
    sm:  'w-8  h-8  text-sm',
    md:  'w-10 h-10 text-sm',
    lg:  'w-12 h-12 text-base',
    xl:  'w-16 h-16 text-xl',
    '2xl':'w-20 h-20 text-2xl',
  };
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden',
      !imageSrc && `bg-gradient-to-br ${gradient}`,
      !imageSrc && 'text-white font-bold select-none',
      sizes[size] || sizes.md,
      className
    )}>
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

export function QtyControl({ qty, onAdd, onRemove, size = 'md' }) {
  const sm = size === 'sm';
  return (
    <div className={cn('flex items-center', sm ? 'gap-1' : 'gap-2')}>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className={cn(
          'flex items-center justify-center rounded-lg font-bold',
          'bg-brand-500 text-white hover:bg-brand-600 active:scale-90 transition-all duration-150',
          sm ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-base'
        )}
        aria-label="Decrease"
      >−</button>
      <span className={cn(
        'font-bold text-brand-600 dark:text-brand-400 text-center',
        sm ? 'w-5 text-sm' : 'w-7 text-base'
      )}>{qty}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        className={cn(
          'flex items-center justify-center rounded-lg font-bold',
          'bg-brand-500 text-white hover:bg-brand-600 active:scale-90 transition-all duration-150',
          sm ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-base'
        )}
        aria-label="Increase"
      >+</button>
    </div>
  );
}

export function AddButton({ onClick, disabled, label = 'Add' }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      className={cn(
        'px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-200',
        'border-2 border-brand-500 text-brand-500',
        'hover:bg-brand-500 hover:text-white',
        'active:scale-95',
        'disabled:opacity-40 disabled:cursor-not-allowed'
      )}
    >
      {disabled ? 'Unavailable' : `+ ${label}`}
    </button>
  );
}

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-all duration-300',
          checked ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-700'
        )}
      >
        <div className={cn(
          'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300',
          checked ? 'left-5' : 'left-0.5'
        )} />
      </div>
      {label && <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{label}</span>}
    </label>
  );
}

export function StarRating({ value = 0, max = 5, onChange, size = 'md' }) {
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <button
          key={star}
          onClick={() => onChange?.(star)}
          className={cn(
            sizes[size] || sizes.md,
            'transition-all duration-150',
            onChange && 'hover:scale-110 cursor-pointer',
            star <= value ? 'text-amber-400' : 'text-surface-300 dark:text-surface-600'
          )}
        >★</button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub, action, actionLabel, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-surface-400" />
        </div>
      )}
      <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-2">{title}</h3>
      {sub && <p className="text-sm text-surface-400 max-w-xs mb-6">{sub}</p>}
      {action && (
        <button
          onClick={action}
          className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors"
        >{actionLabel || 'Browse Menu'}</button>
      )}
    </div>
  );
}
