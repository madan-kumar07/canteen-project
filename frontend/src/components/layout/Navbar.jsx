import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Bell, Menu, Sun, Moon, Wifi, WifiOff, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { Avatar } from '../ui/Avatar';
import { timeAgo, cn } from '../../lib/utils';

export default function Navbar({ onSearch }) {
  const { state, dispatch, cartCount, unreadCount, navigate, isAdmin } = useApp();
  const { user } = state;
  const { isDark, toggleTheme } = useTheme();
  const { connected } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl border-b border-surface-100 dark:border-surface-800/60">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Logo */}
        <button
          onClick={() => navigate(isAdmin ? 'admin' : 'home')}
          className="flex items-center gap-2.5 font-display font-bold text-surface-900 dark:text-white shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-white text-sm font-black">SC</span>
          </div>
          <span className="hidden sm:block text-base">
            <span className="gradient-text">Smart</span>
            <span className="text-surface-900 dark:text-white">Canteen</span>
          </span>
        </button>

        {/* Search bar — desktop */}
        {!isAdmin && (
          <button
            onClick={onSearch}
            className={cn(
              'hidden md:flex flex-1 max-w-md items-center gap-3',
              'h-9 px-4 rounded-xl',
              'bg-surface-50 dark:bg-surface-800/60',
              'border border-surface-200 dark:border-surface-700',
              'text-surface-400 text-sm',
              'hover:border-brand-500/50 hover:bg-surface-100 dark:hover:bg-surface-800',
              'transition-all duration-200'
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search dishes, beverages...</span>
            <kbd className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-500">⌘K</kbd>
          </button>
        )}

        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-1">

          {/* Connection dot */}
          <div
            title={connected ? 'Connected' : 'Disconnected'}
            className={cn(
              'w-2 h-2 rounded-full flex-shrink-0 mx-1',
              connected ? 'bg-green-500' : 'bg-red-500',
              connected && 'animate-pulse'
            )}
          />

          {/* Mobile search */}
          {!isAdmin && (
            <button
              onClick={onSearch}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isDark ? 'moon' : 'sun'}
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setShowNotifs(v => !v); dispatch({ type: 'MARK_ALL_READ' }); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-surface-950" />
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-14 md:top-full mt-2 md:w-80 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl shadow-deep overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                    <span className="font-semibold text-sm">Notifications</span>
                    <button
                      onClick={() => dispatch({ type: 'CLEAR_NOTIFS' })}
                      className="text-xs text-brand-500 font-semibold hover:text-brand-600"
                    >Clear all</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {state.notifications.length === 0 ? (
                      <div className="py-10 text-center text-sm text-surface-400">No notifications yet</div>
                    ) : (
                      state.notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => { n.orderId && navigate('order-detail'); setShowNotifs(false); }}
                          className="flex gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer border-b border-surface-50 dark:border-surface-800/50 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-3.5 h-3.5 text-brand-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{n.title}</p>
                            <p className="text-xs text-surface-400 mt-0.5">{n.msg}</p>
                            <p className="text-xs text-surface-300 dark:text-surface-600 mt-1">{timeAgo(n.time)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart (student only) */}
          {!isAdmin && (
            <button
              onClick={() => navigate('cart')}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}

          {/* Profile (student only) */}
          {!isAdmin && (
            <button
              onClick={() => navigate('profile')}
              title="View Profile"
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors shrink-0"
            >
              <Avatar name={user?.displayName || user?.username || 'U'} colorOverride={user?.avatarColor} imageSrc={user?.profilePic} size="sm" />
            </button>
          )}

          {/* Hamburger */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
