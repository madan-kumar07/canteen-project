import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Modal({ open, onClose, title, children, size = 'md', className = '' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const sizes = {
    sm:   'max-w-sm',
    md:   'max-w-md',
    lg:   'max-w-lg',
    xl:   'max-w-xl',
    '2xl':'max-w-2xl',
    full: 'max-w-full mx-4',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0,  y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className={cn(
              'relative w-full z-10 mx-4 mb-0 sm:mb-0',
              'bg-white dark:bg-surface-900',
              'border border-surface-100 dark:border-surface-800',
              'rounded-t-3xl sm:rounded-3xl shadow-deep',
              'max-h-[90vh] overflow-y-auto',
              sizes[size],
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
                <h2 className="text-h3">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                >
                  <XIcon />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
