import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, ChefHat, Clock, XCircle, Layers, Table2, Activity, TrendingUp, Users, DollarSign, Package, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetOrders, apiUpdateStatus, apiCancelOrder, apiGetDbStats, apiClearCompleted } from '../../api';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatCardSkeleton } from '../ui/Skeleton';
import { cn, formatCurrency, formatDateTime, timeAgo } from '../../lib/utils';

const KANBAN_COLS = [
  { key: 'Pending',   label: 'Pending',   next: 'Preparing', icon: Clock,       color: 'border-t-amber-500',   bg: 'bg-amber-500/5'  },
  { key: 'Preparing', label: 'Preparing', next: 'Ready',     icon: ChefHat,     color: 'border-t-blue-500',    bg: 'bg-blue-500/5'   },
  { key: 'Ready',     label: 'Ready',     next: 'Completed', icon: CheckCircle, color: 'border-t-green-500',   bg: 'bg-green-500/5'  },
  { key: 'Completed', label: 'Done',      next: null,        icon: CheckCircle, color: 'border-t-surface-400', bg: 'bg-surface-50 dark:bg-surface-900' },
];

function StatCard({ icon: Icon, label, value, sub, color = 'text-brand-500', loading = false }) {
  if (loading) return <StatCardSkeleton />;
  return (
    <div className="p-5 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color.replace('text-', 'bg-') + '/10')}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <p className="text-2xl font-display font-bold text-surface-900 dark:text-surface-50">{value}</p>
      <p className="text-xs text-surface-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-surface-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function OrderCard({ order, onAdvance, onCancel, advancing }) {
  const canAdvance = ['Pending', 'Preparing', 'Ready'].includes(order.status);
  const canCancel  = order.status === 'Pending';
  const col        = KANBAN_COLS.find(c => c.key === order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-3.5 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl shadow-sm mb-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-surface-900 dark:text-surface-100 font-mono">#{order.token || order.token_number}</span>
        <StatusBadge status={order.status} />
      </div>
      <div className="space-y-1 mb-3">
        {(order.items || []).slice(0, 2).map((item, i) => (
          <p key={i} className="text-xs text-surface-600 dark:text-surface-400">
            {item.name} × {item.qty || 1}
          </p>
        ))}
        {(order.items || []).length > 2 && (
          <p className="text-xs text-surface-400">+{order.items.length - 2} more</p>
        )}
      </div>
      <div className="flex items-center justify-between mb-3 text-xs text-surface-400">
        <span>{formatCurrency(order.total || order.total_price || 0)}</span>
        <span>{timeAgo(order.placedAt || order.timestamp)}</span>
      </div>
      <div className="flex gap-2">
        {canAdvance && (
          <button
            onClick={() => onAdvance(order, col?.next)}
            disabled={advancing === order.id}
            className="flex-1 py-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {advancing === order.id ? '...' :
             order.status === 'Pending'   ? 'Accept' :
             order.status === 'Preparing' ? 'Mark Ready' : 'Complete'}
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => onCancel(order)}
            className="px-2.5 py-1.5 text-xs font-bold text-red-500 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >Cancel</button>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { toast, navigate } = useApp();
  const [orders, setOrders]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState('kanban'); // kanban | table | queue
  const [advancing, setAdvancing] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ords, st] = await Promise.all([apiGetOrders(), apiGetDbStats()]);
      setOrders(Array.isArray(ords) ? ords : []);
      setStats(st);
    } catch { toast('error', 'Error', 'Could not load orders'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  // Real-time updates
  useEffect(() => {
    const onPlaced = (e) => {
      setOrders(prev => [e.detail, ...prev.filter(o => o.id !== e.detail.id)]);
    };
    const onStatus = (e) => {
      const { orderId, order_id, status, order } = e.detail;
      const id = orderId || order_id;
      setOrders(prev => prev.map(o =>
        (o.id === id || o.order_id === id) ? { ...o, status, ...(order || {}) } : o
      ));
    };
    window.addEventListener('sc:order_placed', onPlaced);
    window.addEventListener('sc:order_status', onStatus);
    return () => {
      window.removeEventListener('sc:order_placed', onPlaced);
      window.removeEventListener('sc:order_status', onStatus);
    };
  }, []);

  const handleAdvance = async (order, nextStatus) => {
    if (!nextStatus) return;
    const id = order.id || order.order_id;
    setAdvancing(id);
    try {
      await apiUpdateStatus(id, nextStatus);
      setOrders(prev => prev.map(o => (o.id === id || o.order_id === id) ? { ...o, status: nextStatus } : o));
      toast('success', `Order Updated`, `#${order.token} → ${nextStatus}`);
    } catch (err) {
      toast('error', 'Update Failed', err.message);
    } finally { setAdvancing(null); }
  };

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel order #${order.token}?`)) return;
    const id = order.id || order.order_id;
    try {
      await apiCancelOrder(id);
      setOrders(prev => prev.map(o => (o.id === id || o.order_id === id) ? { ...o, status: 'Cancelled' } : o));
      toast('info', 'Cancelled', `Order #${order.token} cancelled`);
    } catch (err) {
      toast('error', 'Error', err.message);
    }
  };

  const handleClearCompleted = async () => {
    if (!window.confirm('Remove all completed orders?')) return;
    try {
      await apiClearCompleted();
      setOrders(prev => prev.filter(o => o.status !== 'Completed'));
      toast('success', 'Cleared', 'Completed orders removed');
    } catch (err) {
      toast('error', 'Error', err.message);
    }
  };

  const pendingCount   = orders.filter(o => o.status === 'Pending').length;
  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const readyCount     = orders.filter(o => o.status === 'Ready').length;
  const activeCount    = pendingCount + preparingCount + readyCount;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10 pt-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1">Admin Dashboard</h1>
          <p className="text-surface-400 text-sm mt-0.5">{activeCount} active orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchData}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('menu-mgmt')}>Menu</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('analytics')}>Analytics</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('reports')}>Reports</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={DollarSign} label="Total Revenue"   value={stats ? formatCurrency(stats.total_revenue || 0) : '—'}   color="text-green-500" loading={loading} />
        <StatCard icon={Package}    label="Total Orders"    value={stats?.total_orders ?? '—'}                                color="text-blue-500"  loading={loading} />
        <StatCard icon={Zap}        label="Active Now"      value={activeCount}                                               color="text-brand-500" loading={loading} />
        <StatCard icon={TrendingUp} label="Completed"       value={stats?.completed ?? '—'}                                   color="text-teal-500"  loading={loading} sub="today" />
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl">
          {[['kanban','Kanban',Layers], ['table','Table',Table2], ['queue','Queue',Activity]].map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                view === id ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-sm' : 'text-surface-500'
              )}
            >
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {orders.some(o => o.status === 'Completed') && (
          <Button variant="secondary" size="sm" onClick={handleClearCompleted}>Clear Completed</Button>
        )}
      </div>

      {/* ── KANBAN VIEW ── */}
      {view === 'kanban' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
          {KANBAN_COLS.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            const Icon = col.icon;
            return (
              <div key={col.key} className={cn('rounded-2xl border-t-4 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 p-3', col.color)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-surface-500" />
                    <span className="text-sm font-bold text-surface-700 dark:text-surface-300">{col.label}</span>
                  </div>
                  <span className="text-xs font-bold text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-full">{colOrders.length}</span>
                </div>
                <AnimatePresence>
                  {colOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-surface-400">No orders</div>
                  ) : (
                    colOrders.map(order => (
                      <OrderCard
                        key={order.id || order.order_id}
                        order={order}
                        onAdvance={handleAdvance}
                        onCancel={handleCancel}
                        advancing={advancing}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {view === 'table' && (
        <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-800/50 text-xs font-bold text-surface-500 uppercase tracking-wider">
                  {['Token', 'Items', 'Total', 'Payment', 'Status', 'Placed', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {orders.slice(0, 50).map(order => {
                  const col = KANBAN_COLS.find(c => c.key === order.status);
                  return (
                    <tr key={order.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-surface-900 dark:text-surface-100">#{order.token || order.token_number}</td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400 max-w-[180px] truncate">
                        {(order.items || []).map(i => `${i.name}×${i.qty||1}`).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(order.total || order.total_price || 0)}</td>
                      <td className="px-4 py-3 text-surface-500 capitalize">{order.payment_method || 'counter'}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-surface-400 text-xs">{timeAgo(order.placedAt || order.timestamp)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {col?.next && (
                            <button
                              onClick={() => handleAdvance(order, col.next)}
                              disabled={advancing === order.id}
                              className="text-xs font-bold text-brand-500 hover:text-brand-600 disabled:opacity-50"
                            >
                              {col.next} →
                            </button>
                          )}
                          {order.status === 'Pending' && (
                            <button onClick={() => handleCancel(order)} className="text-xs font-bold text-red-400 hover:text-red-600">Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── QUEUE BOARD ── */}
      {view === 'queue' && (
        <div className="space-y-4">
          {/* Now Serving */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-center">
            <p className="text-white/80 text-sm font-semibold mb-2">Now Serving</p>
            <p className="text-white font-display font-black text-8xl leading-none">
              #{orders.find(o => o.status === 'Ready')?.token || orders.find(o => o.status === 'Preparing')?.token || '—'}
            </p>
            <p className="text-white/70 text-sm mt-3">{readyCount} order{readyCount !== 1 ? 's' : ''} ready for pickup</p>
          </div>

          {/* Queue list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Ready for Pickup', filter: 'Ready',     color: 'text-green-500' },
              { label: 'Being Prepared',   filter: 'Preparing', color: 'text-blue-500'  },
              { label: 'Waiting',          filter: 'Pending',   color: 'text-amber-500' },
            ].map(({ label, filter, color }) => {
              const colOrders = orders.filter(o => o.status === filter);
              return (
                <div key={filter} className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl p-4">
                  <h3 className={cn('text-sm font-bold mb-3', color)}>{label} ({colOrders.length})</h3>
                  <div className="space-y-2">
                    {colOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                        <span className="font-mono font-bold text-surface-900 dark:text-surface-100 text-sm">#{order.token}</span>
                        <span className="text-xs text-surface-400">{timeAgo(order.placedAt || order.timestamp)}</span>
                        {filter !== 'Completed' && (
                          <button
                            onClick={() => handleAdvance(order, KANBAN_COLS.find(c => c.key === order.status)?.next)}
                            className="text-xs font-bold text-brand-500 border border-brand-500/30 px-2.5 py-1 rounded-lg hover:bg-brand-500/10"
                          >
                            {filter === 'Pending' ? 'Accept' : filter === 'Preparing' ? 'Ready' : 'Done'}
                          </button>
                        )}
                      </div>
                    ))}
                    {colOrders.length === 0 && <p className="text-xs text-surface-400 py-4 text-center">Empty</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
