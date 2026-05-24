import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowLeft, TrendingUp, DollarSign, Package, Users, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetOrders } from '../../api';
import { formatCurrency, cn } from '../../lib/utils';

const COLORS = ['#ff6019', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

function buildHourlyData(orders) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, orders: 0, revenue: 0 }));
  orders.forEach(o => {
    const ts = o.placedAt || (o.timestamp && o.timestamp * 1000);
    if (!ts) return;
    const h = new Date(ts).getHours();
    hours[h].orders  += 1;
    hours[h].revenue += (o.total || o.total_price || 0);
  });
  return hours.filter(h => h.orders > 0 || [8,9,10,12,13,14,16,17,18,20,21,22].includes(parseInt(h.hour)));
}

function buildCategoryData(orders) {
  const cats = {};
  orders.forEach(o => (o.items || []).forEach(i => {
    const cat = i.category || 'Other';
    cats[cat] = (cats[cat] || 0) + i.qty * i.price;
  }));
  return Object.entries(cats).map(([name, value]) => ({ name, value }));
}

function buildTopItems(orders) {
  const items = {};
  orders.forEach(o => (o.items || []).forEach(i => {
    items[i.name] = (items[i.name] || 0) + (i.qty || 1);
  }));
  return Object.entries(items)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

export default function AnalyticsPage() {
  const { navigate, toast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiGetOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch { toast('error', 'Error', 'Could not load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const completed = orders.filter(o => o.status === 'Completed');
  const revenue   = orders.reduce((s, o) => s + (o.total || o.total_price || 0), 0);
  const avgOrder  = orders.length ? revenue / orders.length : 0;
  const cancelled = orders.filter(o => o.status === 'Cancelled').length;
  const completionRate = orders.length ? Math.round((completed.length / orders.length) * 100) : 0;

  const hourlyData  = buildHourlyData(orders);
  const categoryData = buildCategoryData(orders);
  const topItems    = buildTopItems(orders);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-xl px-3 py-2 shadow-elevated">
        <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('admin')} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-h1">Analytics</h1>
        </div>
        <button onClick={fetchData} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: DollarSign, label: 'Total Revenue',    value: formatCurrency(revenue),     color: 'text-green-500' },
          { icon: Package,    label: 'Total Orders',     value: orders.length,                color: 'text-blue-500'  },
          { icon: TrendingUp, label: 'Completion Rate',  value: `${completionRate}%`,          color: 'text-brand-500' },
          { icon: Users,      label: 'Avg Order Value',  value: formatCurrency(avgOrder),     color: 'text-purple-500'},
        ].map(s => (
          <div key={s.label} className="p-4 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl">
            <div className={cn('w-9 h-9 rounded-xl mb-3 flex items-center justify-center', s.color.replace('text-', 'bg-') + '/10')}>
              <s.icon className={cn('w-4.5 h-4.5', s.color)} />
            </div>
            <p className="text-xl font-bold text-surface-900 dark:text-surface-50">{loading ? '—' : s.value}</p>
            <p className="text-xs text-surface-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Orders by hour */}
      <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl p-5 mb-5">
        <h3 className="font-bold text-surface-900 dark:text-surface-100 mb-4">Orders by Hour</h3>
        {loading ? (
          <div className="h-48 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#ff6019" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue trend */}
      <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl p-5 mb-5">
        <h3 className="font-bold text-surface-900 dark:text-surface-100 mb-4">Revenue by Hour</h3>
        {loading ? (
          <div className="h-48 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff6019" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6019" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#ff6019" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* Category pie */}
        <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl p-5">
          <h3 className="font-bold text-surface-900 dark:text-surface-100 mb-4">Revenue by Category</h3>
          {loading || categoryData.length === 0 ? (
            <div className="h-40 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status distribution */}
        <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl p-5">
          <h3 className="font-bold text-surface-900 dark:text-surface-100 mb-4">Order Status</h3>
          {['Pending','Preparing','Ready','Completed','Cancelled'].map(status => {
            const count = orders.filter(o => o.status === status).length;
            const pct   = orders.length ? Math.round((count / orders.length) * 100) : 0;
            const colors = { Pending: 'bg-amber-500', Preparing: 'bg-blue-500', Ready: 'bg-green-500', Completed: 'bg-surface-400', Cancelled: 'bg-red-500' };
            return (
              <div key={status} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-xs text-surface-600 dark:text-surface-400 w-20 flex-shrink-0">{status}</span>
                <div className="flex-1 h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                    className={cn('h-full rounded-full', colors[status])}
                  />
                </div>
                <span className="text-xs font-bold text-surface-700 dark:text-surface-300 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top items */}
      <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl p-5">
        <h3 className="font-bold text-surface-900 dark:text-surface-100 mb-4">Top Selling Items</h3>
        {loading ? (
          <div className="h-48 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
        ) : topItems.length === 0 ? (
          <p className="text-surface-400 text-sm text-center py-8">No sales data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topItems} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#ff6019" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
