import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, Clock, ChefHat, ShoppingBag, XCircle, Download, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetOrder, apiCancelOrder } from '../../api';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn, formatCurrency, formatDateTime, getProgressPercent } from '../../lib/utils';

const TIMELINE_STEPS = [
  { key: 'Pending',   label: 'Order Placed',    icon: ShoppingBag,  sub: 'Order received'           },
  { key: 'Preparing', label: 'Preparing',        icon: ChefHat,      sub: 'Being prepared'           },
  { key: 'Ready',     label: 'Ready for Pickup', icon: CheckCircle,  sub: 'Collect at counter'       },
  { key: 'Completed', label: 'Completed',        icon: CheckCircle,  sub: 'Enjoy your meal!'         },
];

const STATUS_ORDER = ['Pending', 'Preparing', 'Ready', 'Completed'];

function QRCode({ token }) {
  // Simple visual QR placeholder — in production use a QR library
  const cells = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      const edge = r === 0 || r === 6 || c === 0 || c === 6;
      const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      const pattern = (r + c + parseInt(token || '0', 10)) % 3 === 0;
      return edge || inner || pattern;
    })
  );
  return (
    <div className="inline-block p-3 bg-white rounded-2xl shadow-card">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.flat().map((on, i) => (
          <div key={i} className={cn('w-5 h-5 rounded-[2px]', on ? 'bg-surface-900' : 'bg-transparent')} />
        ))}
      </div>
      <p className="text-center text-xs font-mono font-bold text-surface-700 mt-2">TOKEN #{token}</p>
    </div>
  );
}

export default function OrderDetailPage() {
  const { state, dispatch, navigate, toast, addToCart } = useApp();
  const order0 = state.selectedOrder;

  const [order, setOrder] = useState(order0 || null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    const id = order?.id || order?.order_id || order0?.id;
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiGetOrder(id);
      setOrder(data);
      dispatch({ type: 'UPDATE_ORDER', payload: { orderId: id, updates: data } });
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (order0) setOrder(order0); }, [order0]);
  useEffect(() => { fetchOrder(); }, []);

  // Real-time updates
  useEffect(() => {
    const handler = (e) => {
      const { orderId, status, order: updated } = e.detail;
      if (orderId === order?.id || orderId === order?.order_id) {
        setOrder(prev => ({ ...prev, status, ...(updated || {}) }));
      }
    };
    window.addEventListener('sc:order_status', handler);
    return () => window.removeEventListener('sc:order_status', handler);
  }, [order?.id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await apiCancelOrder(order?.id || order?.order_id);
      setOrder(prev => ({ ...prev, status: 'Cancelled' }));
      dispatch({ type: 'UPDATE_ORDER', payload: { orderId: order.id, updates: { status: 'Cancelled' } } });
      toast('info', 'Order Cancelled', 'Your order has been cancelled');
    } catch (err) {
      toast('error', 'Cannot Cancel', err.message);
    } finally { setCancelling(false); }
  };

  const handleReorder = () => {
    order?.items?.forEach(item => addToCart(item));
    navigate('cart');
    toast('success', 'Added to cart!', 'Tap items to adjust quantities');
  };

  const downloadInvoice = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      if (!jsPDF) { toast('error', 'PDF not available', 'jsPDF not loaded'); return; }
      const doc = new jsPDF({ unit: 'mm', format: 'a6' });
      doc.setFontSize(14);
      doc.text('SmartCanteen', 10, 12);
      doc.setFontSize(10);
      doc.text(`Invoice: ${order?.id || order?.order_id}`, 10, 20);
      doc.text(`Token: #${order?.token}`, 10, 28);
      doc.text(`Status: ${order?.status}`, 10, 36);
      doc.text(`Total: ${formatCurrency(order?.total || order?.total_price)}`, 10, 44);
      let y = 52;
      (order?.items || []).forEach(item => {
        doc.text(`${item.name} x${item.qty} — ₹${item.price * item.qty}`, 10, y);
        y += 8;
      });
      doc.save(`order-${order?.token}.pdf`);
    } catch (err) {
      console.error(err);
      toast('error', 'Export failed', 'Could not generate PDF');
    }
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-surface-400 mb-4">Order not found</p>
          <Button onClick={() => navigate('orders')} variant="primary">Back to Orders</Button>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';
  const canCancel   = order.status === 'Pending';
  const progress    = getProgressPercent(order.status);
  const token       = order.token || order.token_number;

  return (
    <div className="max-w-lg mx-auto pb-24 px-4 pt-4">
      {/* Back */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate('orders')}
          className="flex items-center gap-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Orders</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={fetchOrder} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Token Card */}
      <div className={cn(
        'p-6 rounded-3xl mb-5 text-center',
        isCancelled
          ? 'bg-red-500/10 border border-red-500/20'
          : 'bg-gradient-to-br from-brand-500 to-brand-700'
      )}>
        <p className={cn('text-sm font-semibold mb-1', isCancelled ? 'text-red-500' : 'text-white/80')}>
          {isCancelled ? 'Order Cancelled' : 'Your Token Number'}
        </p>
        <p className={cn('text-7xl font-display font-black leading-none', isCancelled ? 'text-red-500' : 'text-white')}>
          #{token}
        </p>
        <p className={cn('text-sm mt-2', isCancelled ? 'text-surface-400' : 'text-white/70')}>
          {isCancelled ? 'This order was cancelled' : 'Show this number at the counter'}
        </p>
        {!isCancelled && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <p className="text-white/70 text-xs mt-1.5">{progress}% complete</p>
          </div>
        )}
      </div>

      {/* QR Code */}
      {!isCancelled && (
        <div className="flex justify-center mb-5">
          <QRCode token={token} />
        </div>
      )}

      {/* Timeline */}
      {!isCancelled && (
        <div className="p-5 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl mb-5">
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-4">Order Progress</h3>
          <div className="space-y-4">
            {TIMELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStep;
              const current = i === currentStep;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500',
                      done   ? 'bg-brand-500 shadow-brand-sm' :
                      'bg-surface-100 dark:bg-surface-800'
                    )}>
                      <Icon className={cn('w-4 h-4', done ? 'text-white' : 'text-surface-400')} />
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={cn('w-0.5 flex-1 mt-1 min-h-[20px] rounded-full transition-colors duration-500',
                        done && i < currentStep ? 'bg-brand-500' : 'bg-surface-100 dark:bg-surface-800'
                      )} />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className={cn('text-sm font-semibold', done ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400')}>
                      {step.label}
                      {current && <span className="ml-2 text-[10px] text-brand-500 font-bold uppercase animate-pulse">Now</span>}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="p-5 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl mb-5">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-4">Items Ordered</h3>
        <div className="space-y-3">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-500">{item.qty || 1}</span>
                <span className="text-sm text-surface-700 dark:text-surface-300">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">₹{item.price * (item.qty || 1)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-surface-100 dark:border-surface-800 mt-4 pt-4 flex justify-between">
          <span className="font-bold text-surface-900 dark:text-surface-50">Total</span>
          <span className="font-bold text-lg">{formatCurrency(order.total || order.total_price)}</span>
        </div>
      </div>

      {/* Order Info */}
      <div className="p-5 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl mb-5">
        <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-4">Order Details</h3>
        <div className="space-y-3 text-sm">
          {[
            ['Order ID', order.id || order.order_id],
            ['Placed At', formatDateTime(order.placedAt || order.timestamp)],
            ['Payment',   order.payment_method || 'Counter'],
            ['Pickup',    order.pickup_slot || order.pickup_time || 'ASAP'],
            order.note && ['Note', order.note],
          ].filter(Boolean).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-surface-400">{k}</span>
              <span className="font-medium text-surface-900 dark:text-surface-100 text-right max-w-[60%]">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="secondary" className="w-full" icon={<RotateCcw className="w-4 h-4" />} onClick={handleReorder}>
          Reorder
        </Button>
        <Button variant="secondary" className="w-full" icon={<Download className="w-4 h-4" />} onClick={downloadInvoice}>
          Download Invoice
        </Button>
        {canCancel && (
          <Button variant="danger" className="w-full" loading={cancelling} icon={<XCircle className="w-4 h-4" />} onClick={handleCancel}>
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}
