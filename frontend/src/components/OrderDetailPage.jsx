import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, formatDateTime, timeAgo } from '../utils/ui';
import { updateOrderStatus, cancelOrder, getOrders } from '../api';

const TIMELINE_STEPS = [
  { status: 'Pending',   icon: '📝', label: 'Order Placed',    sub: 'We received your order' },
  { status: 'Confirmed', icon: '✅', label: 'Confirmed',        sub: 'Order accepted by canteen' },
  { status: 'Preparing', icon: '👨‍🍳', label: 'Preparing',        sub: 'Chef is preparing your meal' },
  { status: 'Ready',     icon: '🔔', label: 'Ready for Pickup', sub: 'Come collect your order' },
  { status: 'Completed', icon: '✅', label: 'Completed',        sub: 'Enjoy your meal!' },
];

const STATUS_ORDER = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];

export default function OrderDetailPage() {
  const { state, dispatch, toast, navigate } = useApp();
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  /* Get the selected order, refreshed from history */
  const rawOrder  = state.selectedOrder;
  const liveOrder = rawOrder
    ? (state.orderHistory.find(o => o.id === rawOrder.id || o.order_id === rawOrder.id) || rawOrder)
    : null;

  /* Real-time status updates */
  useEffect(() => {
    const handler = (e) => {
      const { orderId, status } = e.detail;
      if (liveOrder && (orderId === liveOrder.id || orderId === liveOrder.order_id)) {
        dispatch({ type: 'SET_SELECTED_ORDER', payload: { ...liveOrder, status } });
      }
    };
    window.addEventListener('order_status_changed', handler);
    return () => window.removeEventListener('order_status_changed', handler);
  }, [liveOrder, dispatch]);

  if (!liveOrder) {
    return (
      <div className="order-detail-page">
        <button className="back-btn" onClick={() => navigate('orders')}>← Back to Orders</button>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <div style={{ fontWeight: 700 }}>Order not found</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('orders')}>View Orders</button>
        </div>
      </div>
    );
  }

  const order = liveOrder;
  const currentStatusIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';
  const isCompleted = order.status === 'Completed';
  const canCancel   = order.status === 'Pending';
  const token = order.token || String(order.id || '').slice(-4);

  /* ─── QR Code (simple CSS-based) ─── */
  const qrData = `SC:${order.id}:${token}`;

  /* ─── Cancel order ─── */
  const handleCancel = async () => {
    if (!canCancel) return;
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await cancelOrder(order.id);
      dispatch({ type: 'UPDATE_ORDER_IN_HISTORY', payload: { orderId: order.id, updates: { status: 'Cancelled' } } });
      dispatch({ type: 'SET_SELECTED_ORDER', payload: { ...order, status: 'Cancelled' } });
      toast('info', 'Order Cancelled', 'Your order has been cancelled.');
    } catch {
      toast('error', 'Cancel Failed', 'Could not cancel. Please try at counter.');
    } finally {
      setCancelling(false);
    }
  };

  /* ─── Reorder ─── */
  const handleReorder = () => {
    setReordering(true);
    order.items?.forEach(item => {
      for (let q = 0; q < (item.qty || 1); q++) {
        dispatch({ type: 'ADD_TO_CART', payload: { item } });
      }
    });
    toast('order', '🔄 Reordered!', `${order.items?.length || 0} items added to cart`);
    navigate('cart');
  };

  /* ─── Download Invoice ─── */
  const downloadInvoice = () => {
    const lines = [
      '=== SmartCanteen Invoice ===',
      `Order ID: ${order.id}`,
      `Token: #${token}`,
      `Date: ${formatDateTime(order.placedAt)}`,
      `Status: ${order.status}`,
      '',
      '--- Items ---',
      ...(order.items || []).map(i => `${i.name} x${i.qty}  ₹${i.price * i.qty}`),
      '',
      `Subtotal: ₹${order.subtotal || order.total}`,
      `GST (5%): ₹${order.gst || 0}`,
      order.discount ? `Discount: -₹${order.discount}` : '',
      `TOTAL: ₹${order.total}`,
      '',
      `Payment: ${order.payment_method || 'Counter'}`,
      `Pickup: ${order.pickup_slot || 'ASAP'}`,
    ].filter(Boolean).join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `SmartCanteen_${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Invoice Downloaded', '');
  };

  return (
    <div className="order-detail-page">
      <button className="back-btn" onClick={() => navigate('orders')}>← Back to Orders</button>

      {/* Order Header */}
      <div className="order-detail-header animate-slide-up">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4 }}>TOKEN NUMBER</div>
            <div className="order-detail-token">#{token}</div>
            <div className="order-detail-id">Order ID: {order.id}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 4 }}>
              {formatDateTime(order.placedAt)} · {timeAgo(order.placedAt)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <StatusBadge status={order.status} />
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--coral)' }}>₹{order.total}</div>
          </div>
        </div>
      </div>

      {/* Live Timeline */}
      {!isCancelled && (
        <div className="order-detail-section animate-slide-up stagger-1">
          <div className="order-detail-section-title">📍 Live Order Status</div>
          <div className="timeline" role="list" aria-label="Order progress">
            {TIMELINE_STEPS.filter(s => s.status !== 'Confirmed').map((step, i) => {
              const stepIdx  = STATUS_ORDER.indexOf(step.status);
              let stepState  = 'pending';
              if (isCancelled) stepState = 'pending';
              else if (stepIdx < currentStatusIdx) stepState = 'done';
              else if (stepIdx === currentStatusIdx) stepState = 'active';

              return (
                <div key={step.status} className={`timeline-step ${stepState}`} role="listitem">
                  <div className="timeline-dot" aria-hidden="true" />
                  <div>
                    <div className="timeline-step-label">
                      {step.icon} {step.label}
                      {stepState === 'active' && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--coral)' }}>● Now</span>}
                    </div>
                    <div className="timeline-step-sub">{step.sub}</div>
                  </div>
                </div>
              );
            })}
            {isCancelled && (
              <div className="timeline-step" style={{ color: 'var(--red)' }} role="listitem">
                <div className="timeline-dot" style={{ background: 'var(--red)', borderColor: 'var(--red)' }} />
                <div>
                  <div className="timeline-step-label">❌ Cancelled</div>
                  <div className="timeline-step-sub">Your order was cancelled</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code (Ready status) */}
      {(order.status === 'Ready' || order.status === 'Preparing') && (
        <div className="order-detail-section animate-scale-pop">
          <div className="order-detail-section-title">📱 Pickup QR Code</div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              display: 'inline-block',
              background: 'white',
              padding: 20,
              borderRadius: 16,
              boxShadow: 'var(--shadow2)',
            }}>
              <QRDisplay value={qrData} />
              <div style={{ color: '#111', fontWeight: 800, fontSize: '1.5rem', marginTop: 12, fontFamily: 'Syne, sans-serif' }}>
                #{token}
              </div>
              <div style={{ color: '#666', fontSize: '0.75rem', marginTop: 4 }}>Show this at the counter</div>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="order-detail-section animate-slide-up stagger-2">
        <div className="order-detail-section-title">🍽️ Ordered Items</div>
        {(order.items || []).map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0', borderBottom: '1px solid var(--glass-border)'
          }}>
            <div style={{ fontSize: '1.3rem', width: 32, textAlign: 'center' }}>
              {item.name?.toLowerCase().includes('veg') ? '🟢' : '🔴'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>₹{item.price} × {item.qty}</div>
            </div>
            <div style={{ fontWeight: 800, color: 'var(--coral)' }}>₹{item.price * item.qty}</div>
          </div>
        ))}
      </div>

      {/* Bill Breakdown */}
      <div className="order-detail-section animate-slide-up stagger-3">
        <div className="order-detail-section-title">💳 Bill Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text2)' }}>
            <span>Subtotal</span><span>₹{order.subtotal || order.total}</span>
          </div>
          {order.gst > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text2)' }}>
              <span>GST (5%)</span><span>₹{order.gst}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--mint)' }}>
              <span>Discount ({order.promo})</span><span>−₹{order.discount}</span>
            </div>
          )}
          <div style={{ height: 1, background: 'var(--glass-border)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
            <span>Total Paid</span><span style={{ color: 'var(--coral)' }}>₹{order.total}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text3)' }}>
            <span>Payment Method</span>
            <span style={{ fontWeight: 600 }}>
              {order.payment_method === 'online' ? '💳 Online' :
               order.payment_method === 'wallet' ? '💰 Wallet' : '🏪 Counter'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text3)' }}>
            <span>Pickup Time</span><span style={{ fontWeight: 600 }}>{order.pickup_slot || 'ASAP'}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="order-detail-section animate-slide-up stagger-4">
        <div className="order-detail-section-title">⚡ Quick Actions</div>
        <div className="order-actions">
          <button className="order-action-btn primary" onClick={handleReorder} disabled={reordering}>
            🔄 Reorder
          </button>
          <button className="order-action-btn" onClick={downloadInvoice}>
            📄 Invoice
          </button>
          {canCancel && (
            <button className="order-action-btn danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? '…' : '❌ Cancel'}
            </button>
          )}
          <button
            className="order-action-btn"
            onClick={() => { navigate('orders'); }}
          >
            📋 All Orders
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Simple visual QR (grid pattern) ─────────────────── */
function QRDisplay({ value }) {
  // Generate a deterministic grid from the value string
  const hash = value.split('').reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0);
  const size = 21;
  const cells = Array.from({ length: size * size }, (_, i) => {
    const x = i % size, y = Math.floor(i / size);
    // Corner squares (position detection patterns)
    const inCorner = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
    const inInnerCorner = (x >= 1 && x <= 5 && y >= 1 && y <= 5) ||
                           (x >= size-6 && x <= size-2 && y >= 1 && y <= 5) ||
                           (x >= 1 && x <= 5 && y >= size-6 && y <= size-2);
    if (inCorner) return !inInnerCorner || (x === 3 && y === 3) || (x === size-4 && y === 3) || (x === 3 && y === size-4) ? true : false;
    // Data modules — pseudo-random from hash
    return !!((hash * (i + 1) * 2654435761) & 1);
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 6px)`, gap: 1 }}>
      {cells.map((on, i) => (
        <div key={i} style={{ width: 6, height: 6, background: on ? '#111' : 'white' }} />
      ))}
    </div>
  );
}
