import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, EmptyState, SkeletonCard, formatDateTime, timeAgo } from '../utils/ui';
import { getOrders } from '../api';

export default function OrdersPage() {
  const { state, dispatch, navigate } = useApp();
  const [tab,     setTab]     = useState('active'); // active | past
  const [fetching, setFetching] = useState(false);

  /* Sync with backend on mount */
  const syncOrders = useCallback(async () => {
    if (!state.user) return;
    setFetching(true);
    try {
      const all = await getOrders();
      // Merge backend orders for this user with local history
      const myOrders = all.filter(o => o.user === state.user.username);
      const merged = mergeOrders(state.orderHistory, myOrders);
      dispatch({ type: 'SET_ORDER_HISTORY', payload: merged });
    } catch {
      // keep local history on failure
    } finally {
      setFetching(false);
    }
  }, [state.user, state.orderHistory, dispatch]);

  useEffect(() => { syncOrders(); }, []);

  /* Real-time updates */
  useEffect(() => {
    const handler = (e) => {
      const { orderId, status } = e.detail;
      dispatch({ type: 'UPDATE_ORDER_IN_HISTORY', payload: { orderId, updates: { status } } });
    };
    window.addEventListener('order_status_changed', handler);
    return () => window.removeEventListener('order_status_changed', handler);
  }, [dispatch]);

  const activeStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready'];
  const activeOrders = state.orderHistory.filter(o => activeStatuses.includes(o.status));
  const pastOrders   = state.orderHistory.filter(o => !activeStatuses.includes(o.status));

  const displayOrders = tab === 'active' ? activeOrders : pastOrders;

  return (
    <div className="orders-page">
      {/* Header */}
      <div style={{ marginBottom: 'var(--s5)' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
          📋 My Orders
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>
          {state.orderHistory.length} total orders
          {fetching && <span style={{ marginLeft: 8, color: 'var(--coral)', fontSize: '0.75rem' }}>● Syncing…</span>}
        </p>
      </div>

      {/* Tabs */}
      <div className="orders-tabs" role="tablist">
        <button
          className={`orders-tab ${tab === 'active' ? 'active' : ''}`}
          onClick={() => setTab('active')}
          role="tab"
          aria-selected={tab === 'active'}
        >
          Active {activeOrders.length > 0 && `(${activeOrders.length})`}
        </button>
        <button
          className={`orders-tab ${tab === 'past' ? 'active' : ''}`}
          onClick={() => setTab('past')}
          role="tab"
          aria-selected={tab === 'past'}
        >
          Past Orders {pastOrders.length > 0 && `(${pastOrders.length})`}
        </button>
      </div>

      {/* Order list */}
      {fetching && displayOrders.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} height={100} />)}
        </div>
      ) : displayOrders.length === 0 ? (
        <EmptyState
          art={tab === 'active' ? '🛒' : '📋'}
          title={tab === 'active' ? 'No active orders' : 'No past orders'}
          sub={tab === 'active' ? 'Place an order to see it here' : 'Your order history will appear here'}
          action={() => navigate('home')}
          actionLabel="Browse Menu"
        />
      ) : (
        <div role="list" aria-label="Orders">
          {displayOrders.map((order, i) => (
            <OrderCard
              key={order.id || i}
              order={order}
              onOpen={() => navigate('order-detail', order)}
              onReorder={() => {
                order.items?.forEach(item => {
                  for (let q = 0; q < (item.qty || 1); q++) {
                    dispatch({ type: 'ADD_TO_CART', payload: { item } });
                  }
                });
                navigate('cart');
              }}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Order Card ────────────────────────────────────────── */
function OrderCard({ order, onOpen, onReorder, index }) {
  const token       = order.token || String(order.id || '').slice(-4);
  const itemNames   = (order.items || []).map(i => i.name).join(', ');
  const isActive    = ['Pending', 'Confirmed', 'Preparing', 'Ready'].includes(order.status);

  return (
    <div
      className={`order-card animate-slide-up stagger-${(index % 5) + 1}`}
      onClick={onOpen}
      role="listitem"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
      aria-label={`Order #${token}, ${order.status}, ₹${order.total}`}
    >
      <div className="order-card-top">
        <div>
          <div className="order-card-id">
            #{token}
            {isActive && (
              <span style={{ marginLeft: 8, fontSize: '0.65rem', color: 'var(--coral)', fontWeight: 700 }}>LIVE</span>
            )}
          </div>
          <div className="order-card-time">{formatDateTime(order.placedAt)} · {timeAgo(order.placedAt)}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-card-items" title={itemNames}>
        {itemNames || 'Order details'}
      </div>

      {/* Progress bar for active orders */}
      {isActive && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: 4,
              background: 'linear-gradient(90deg, var(--coral), var(--amber))',
              width: `${getProgressPercent(order.status)}%`,
              transition: 'width 0.8s ease',
            }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: 4 }}>
            {getStatusMessage(order.status)}
          </div>
        </div>
      )}

      <div className="order-card-bottom">
        <div className="order-card-total">₹{order.total}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={e => { e.stopPropagation(); onReorder(); }}
            aria-label="Reorder this order"
          >🔄 Reorder</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={e => { e.stopPropagation(); onOpen(); }}
          >View →</button>
        </div>
      </div>
    </div>
  );
}

function getProgressPercent(status) {
  const map = { Pending: 20, Confirmed: 40, Preparing: 65, Ready: 90, Completed: 100 };
  return map[status] || 0;
}

function getStatusMessage(status) {
  const map = {
    Pending:   'Waiting for canteen to accept…',
    Confirmed: 'Order confirmed! Chef will start soon',
    Preparing: '👨‍🍳 Chef is cooking your meal…',
    Ready:     '🔔 Your order is ready! Come pick it up',
    Completed: '✅ Order completed',
  };
  return map[status] || '';
}

/* ── Merge helper ─────────────────────────────────────── */
function mergeOrders(local, remote) {
  const map = new Map();
  local.forEach(o  => map.set(o.id, o));
  remote.forEach(o => {
    const existing = map.get(o.id);
    if (existing) {
      map.set(o.id, { ...existing, status: o.status, updatedAt: o.updatedAt || existing.updatedAt });
    } else {
      map.set(o.id, o);
    }
  });
  return Array.from(map.values()).sort((a, b) => (b.placedAt || 0) - (a.placedAt || 0));
}
