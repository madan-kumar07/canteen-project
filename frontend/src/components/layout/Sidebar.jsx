import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Search, ShoppingCart, ClipboardList, User, Settings, LogOut, Wallet, BarChart3, UtensilsCrossed, Scan, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { formatCurrency } from '../../lib/utils';

const STUDENT_NAV = [
  { id: 'home',     icon: Home,          label: 'Home'         },
  { id: 'search',   icon: Search,        label: 'Search'       },
  { id: 'cart',     icon: ShoppingCart,  label: 'Cart'         },
  { id: 'orders',   icon: ClipboardList, label: 'My Orders'    },
  { id: 'profile',  icon: User,          label: 'Profile'      },
  { id: 'settings', icon: Settings,      label: 'Settings'     },
];

const ADMIN_NAV = [
  { id: 'admin',     icon: BarChart3,       label: 'Dashboard'     },
  { id: 'menu-mgmt', icon: UtensilsCrossed, label: 'Menu'          },
  { id: 'analytics', icon: BarChart3,       label: 'Analytics'     },
  { id: 'scan',      icon: Scan,            label: 'Scan QR'       },
  { id: 'reports',   icon: FileText,        label: 'Reports'       },
];

export default function Sidebar() {
  const { state, dispatch, cartCount, navigate, isAdmin } = useApp();
  const { sidebarOpen, user } = state;

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const close = () => dispatch({ type: 'CLOSE_SIDEBAR' });

  const handleNav = (id) => { navigate(id); close(); };

  const handleLogout = () => {
    localStorage.removeItem('sc_user');
    dispatch({ type: 'LOGOUT' });
    close();
  };

  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed right-0 top-0 h-full z-50 w-72 bg-white dark:bg-surface-950 border-l border-surface-100 dark:border-surface-800 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-800">
              <button
                onClick={() => {
                  if (isAdmin) handleNav('admin');
                  else handleNav('profile');
                }}
                className="flex items-center gap-3 text-left hover:opacity-80 active:scale-95 transition-all duration-150"
              >
                <Avatar 
                  name={user?.displayName || user?.username || 'U'} 
                  colorOverride={user?.avatarColor} 
                  imageSrc={user?.profilePic} 
                  size="md" 
                />
                <div>
                  <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{user?.displayName || user?.username}</p>
                  <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
                </div>
              </button>
              <button
                onClick={close}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wallet (student) */}
            {!isAdmin && (
              <div
                onClick={() => handleNav('profile')}
                className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-white/80" />
                  <span className="text-xs text-white/80 font-medium">Wallet Balance</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(state.wallet)}</p>
                <p className="text-xs text-white/70 mt-1">{state.loyaltyPoints} loyalty points</p>
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = state.activePage === item.id;
                const badge = item.id === 'cart' ? cartCount : 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    <span className="text-sm flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className="w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-surface-100 dark:border-surface-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
              <p className="text-center text-xs text-surface-300 dark:text-surface-700 mt-3">SmartCanteen v3 · JJ College</p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
