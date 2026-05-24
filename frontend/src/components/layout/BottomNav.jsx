import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

const TABS = [
  { id: 'home',    icon: Home,          label: 'Home'   },
  { id: 'search',  icon: Search,        label: 'Search' },
  { id: 'cart',    icon: ShoppingCart,  label: 'Cart'   },
  { id: 'orders',  icon: ClipboardList, label: 'Orders' },
  { id: 'profile', icon: User,          label: 'Profile'},
];

export default function BottomNav() {
  const { state, dispatch, cartCount, activeOrders } = useApp();
  const { activePage } = state;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-surface-950/95 backdrop-blur-xl border-t border-surface-100 dark:border-surface-800 safe-bottom md:hidden">
      <div className="flex items-center justify-around h-14 px-2">
        {TABS.map(tab => {
          const Icon   = tab.icon;
          const active = activePage === tab.id;
          const badge  =
            tab.id === 'cart'   ? cartCount :
            tab.id === 'orders' ? activeOrders?.length : 0;

          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_PAGE', payload: tab.id })}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full',
                'transition-all duration-200 rounded-xl',
                active ? 'text-brand-500' : 'text-surface-400 dark:text-surface-600'
              )}
            >
              <div className="relative">
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="bottomNavActive"
                      className="absolute inset-0 -inset-y-1 -inset-x-2 rounded-xl bg-brand-500/10"
                    />
                  )}
                </AnimatePresence>
                <Icon className={cn('w-5 h-5 relative', active && 'stroke-[2.5]')} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-semibold leading-none', active && 'text-brand-500')}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
