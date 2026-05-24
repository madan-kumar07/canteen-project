import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronRight, Package, CheckCircle, Clock, ChefHat, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetOrders } from '../../api';
import { StatusBadge } from '../ui/Badge';
import { OrderCardSkeleton } from '../ui/Skeleton';
import { cn, formatCurrency, formatDateTime, timeAgo, getProgressPercent } from '../../lib/utils';

function OrderCard({ order, onClick }) {
  const progress = getProgressPercent(order.status);
  const isActive = ['Pending', 'Preparing', 'Ready'].includes(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="p-4 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-surface-900 dark:text-surface-100">
              #{order.token || order.token_number}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-surface-400 mt-0.5">{formatDateTime(order.placedAt || order.timestamp)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-surface-900 dark:text-surface-50">{formatCurrency(order.total || order.total_price)}</p>
          <p className="text-xs text-surface-400">{order.items?.length || 0} items</p>
        </div>
      </div>

      <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-1 mb-3">
        {order.items?.map(i => `${i.name} ×${i.qty || 1}`).join(', ') || 'Order items'}
      </p>

      {/* Progress bar for active orders */}
      {isActive && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-surface-500">Progress</span>
            <span className="text-xs font-semibold text-brand-500">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn('h-full rounded-full',
                order.status === 'Ready'     ? 'bg-green-500' :
                order.status === 'Preparing' ? 'bg-blue-500'  : 'bg-amber-500'
              )}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-surface-400">{timeAgo(order.placedAt || order.timestamp)}</span>
        <span className="text-xs text-brand-500 font-semibold flex items-center gap-1">
          Details <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const { state, navigate } = useApp();
  const [tab, setTab]         = useState('active');
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetOrders();
      const all  = Array.isArray(data) ? data : [];
      const mine = all.filter(o => !o.user || o.user === state.user?.username);
      // Merge with local history (shows orders even if backend resets)
      const local = state.orderHistory || [];
      const merged = [...mine];
      local.forEach(lo => {
        if (!merged.find(m => m.id === lo.id || m.order_id === lo.order_id)) merged.push(lo);
      });
      setOrders(merged);
    } catch {
      setOrders(state.orderHistory || []);
    } finally {
      setLoading(false);
    }
  }, [state.user?.username, state.orderHistory]);

  useEffect(() => { fetchOrders(); }, []);

  // Real-time updates
  useEffect(() => {
    const handler = (e) => {
      const { orderId, status, order } = e.detail;
      setOrders(prev => prev.map(o =>
        (o.id === orderId || o.order_id === orderId) ? { ...o, status, ...(order || {}) } : o
      ));
    };
    window.addEventListener('sc:order_status', handler);
    return () => window.removeEventListener('sc:order_status', handler);
  }, []);

  const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status));
  const pastOrders   = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

  const handleOrderClick = (order) => {
    navigate('order-detail', order);
  };

  return (
    <div className="max-w-lg mx-auto pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-h2">My Orders</h1>
        <button onClick={fetchOrders} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl mb-5">
        {[['active', 'Active', activeOrders.length], ['past', 'Past', pastOrders.length]].map(([id, label, count]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn('flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all',
              tab === id ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm' : 'text-surface-500'
            )}
          >
            {label} {count > 0 && <span className={cn('ml-1 text-xs', tab === id ? 'text-brand-500' : 'text-surface-400')}>({count})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <OrderCardSkeleton key={i} />)}
        </div>
      ) : tab === 'active' ? (
        activeOrders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-surface-400" />
            </div>
            <p className="font-semibold text-surface-900 dark:text-surface-100 mb-2">No active orders</p>
            <p className="text-sm text-surface-400 mb-6">Place an order and track it here in real-time</p>
            <button onClick={() => navigate('home')} className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600">
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => (
              <OrderCard key={order.id || order.order_id} order={order} onClick={() => handleOrderClick(order)} />
            ))}
          </div>
        )
      ) : (
        pastOrders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-surface-400 text-sm">No completed orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastOrders.map(order => (
              <OrderCard key={order.id || order.order_id} order={order} onClick={() => handleOrderClick(order)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
