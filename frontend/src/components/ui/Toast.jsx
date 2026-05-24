import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

function ToastIcon({ type }) {
  const classes = 'w-5 h-5 flex-shrink-0';
  switch (type) {
    case 'success': return <CheckCircle  className={cn(classes, 'text-green-500')} />;
    case 'error':   return <XCircle      className={cn(classes, 'text-red-500')} />;
    case 'warning': return <AlertTriangle className={cn(classes, 'text-amber-500')} />;
    default:        return <Info         className={cn(classes, 'text-blue-500')} />;
  }
}

function Toast({ toast }) {
  const { dispatch } = useApp();
  const [visible, setVisible] = useState(true);
  const duration = toast.duration || 4000;

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id }), 300);
  };

  useEffect(() => {
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [duration]);

  const borders = {
    success: 'border-l-green-500',
    error:   'border-l-red-500',
    warning: 'border-l-amber-500',
    info:    'border-l-blue-500',
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0,  scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={cn(
            'flex items-start gap-3 p-4 pr-10 relative',
            'bg-white dark:bg-surface-900',
            'border border-surface-100 dark:border-surface-800',
            'border-l-4', borders[toast.type] || borders.info,
            'rounded-2xl shadow-elevated',
            'max-w-sm w-full',
          )}
          role="alert"
        >
          <ToastIcon type={toast.type} />
          <div className="flex-1 min-w-0">
            {toast.title && <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">{toast.title}</p>}
            {toast.msg   && <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 leading-relaxed">{toast.msg}</p>}
          </div>
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center text-surface-400 hover:text-surface-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
            className={cn(
              'absolute bottom-0 left-0 h-0.5 w-full rounded-b-2xl',
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error'   ? 'bg-red-500'   :
              toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ToastContainer() {
  const { state } = useApp();
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {state.toasts.map(t => <Toast key={t.id} toast={t} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
