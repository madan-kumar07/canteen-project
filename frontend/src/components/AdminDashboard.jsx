import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, SkeletonCard, formatDateTime, timeAgo } from '../utils/ui';
import { getOrders, updateOrderStatus, cancelOrder, getMenu, addMenuItem, deleteMenuItem, toggleMenuAvail, getAnalytics } from '../api';

const STATUS_FLOW = { Pending: 'Confirmed', Confirmed: 'Preparing', Preparing: 'Ready', Ready: 'Completed' };

export default function AdminDashboard() {
  const { dispatch, toast } = useApp();
  const [tab,       setTab]       = useState('kanban'); // kanban | menu | analytics
  const [orders,    setOrders]    = useState([]);
  const [menu,      setMenu]      = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activity,  setActivity]  = useState([]);
  const [showAdd,   setShowAdd]   = useState(false);
  const [newItem,   setNewItem]   = useState({ name:'', price:'', category:'', image:'' });
  const pollRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [ordersData, menuData] = await Promise.all([getOrders(), getMenu()]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setMenu(Array.isArray(menuData)   ? menuData   : []);
    } catch { /* silent */ }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    // Poll every 8s as backup to WebSocket
    pollRef.current = setInterval(fetchAll, 8000);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  // Real-time events
  useEffect(() => {
    const onPlaced = (e) => {
      setOrders(prev => [e.detail, ...prev.filter(o => o.id !== e.detail.id)]);
      addActivity('🆕', `New order #${e.detail.token} from ${e.detail.user}`, 'coral');
    };
    const onStatus = (e) => {
      const { orderId, status, order } = e.detail;
      setOrders(prev => prev.map(o => (o.id === orderId || o.order_id === orderId)
        ? { ...o, status, ...(order || {}) } : o));
      addActivity('📝', `Order #${e.detail.order?.token || orderId.slice(-4)} → ${status}`, 'blue');
    };
    const onMenu = () => { fetchAll(); };
    window.addEventListener('order_placed',          onPlaced);
    window.addEventListener('order_status_changed',  onStatus);
    window.addEventListener('menu_item_updated',     onMenu);
    return () => {
      window.removeEventListener('order_placed',          onPlaced);
      window.removeEventListener('order_status_changed',  onStatus);
      window.removeEventListener('menu_item_updated',     onMenu);
    };
  }, [fetchAll]);

  const addActivity = (icon, text, color = 'coral') => {
    setActivity(prev => [{ icon, text, color, time: Date.now() }, ...prev].slice(0, 50));
  };

  /* ─── Order status advance ─── */
  const advanceOrder = async (orderId, currentStatus) => {
    const nextStatus = STATUS_FLOW[currentStatus];
    if (!nextStatus) return;
    try {
      await updateOrderStatus(orderId, nextStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      toast('success', 'Status Updated', `Order → ${nextStatus}`);
    } catch {
      toast('error', 'Update Failed', '');
    }
  };

  const cancelOrd = async (orderId) => {
    try {
      await cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      toast('info', 'Order Cancelled', '');
    } catch {
      toast('error', 'Cancel Failed', '');
    }
  };

  /* ─── Menu management ─── */
  const toggleItem = async (id, available) => {
    try {
      await toggleMenuAvail(id, available);
      setMenu(prev => prev.map(i => i.id === id ? { ...i, available } : i));
      addActivity(available ? '✅' : '❌', `Menu item ${available ? 'enabled' : 'disabled'} #${id}`, 'mint');
    } catch { toast('error', 'Toggle Failed', ''); }
  };

  const deleteItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteMenuItem(id);
      setMenu(prev => prev.filter(i => i.id !== id));
      addActivity('🗑️', `Deleted menu item: ${name}`, 'red');
    } catch { toast('error', 'Delete Failed', ''); }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.price || !newItem.category.trim()) {
      toast('error', 'Missing fields', 'Name, price and category are required');
      return;
    }
    try {
      const res = await addMenuItem({ ...newItem, price: parseFloat(newItem.price) });
      setMenu(prev => [...prev, res.item]);
      setNewItem({ name:'', price:'', category:'', image:'' });
      setShowAdd(false);
      toast('success', 'Item Added!', res.item.name);
      addActivity('➕', `Added menu item: ${res.item.name}`, 'mint');
    } catch { toast('error', 'Add Failed', ''); }
  };

  /* ─── Computed stats ─── */
  const activeOrders    = orders.filter(o => !['Completed','Cancelled'].includes(o.status));
  const todayRevenue    = orders.filter(o => o.status === 'Completed').reduce((s, o) => s + (o.total || 0), 0);
  const completionRate  = orders.length ? Math.round((orders.filter(o => o.status==='Completed').length / orders.length) * 100) : 0;
  const pendingCount    = orders.filter(o => o.status === 'Pending').length;
  const rushLabel       = pendingCount > 10 ? '🔴 High Rush' : pendingCount > 4 ? '🟡 Medium Rush' : '🟢 Low Rush';

  /* ─── Kanban columns ─── */
  const kanbanCols = [
    { key: 'Pending',   label: 'Pending',   cls: 'pending'   },
    { key: 'Preparing', label: 'Preparing', cls: 'preparing' },
    { key: 'Ready',     label: 'Ready',     cls: 'ready'     },
    { key: 'Completed', label: 'Completed', cls: 'completed' },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} height={80} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-header-title">🎛️ Admin Dashboard</div>
          <div className="admin-header-sub">
            {new Date().toLocaleString('en-IN', { weekday:'long', hour:'2-digit', minute:'2-digit', hour12:true })}
            &nbsp;·&nbsp;{rushLabel}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchAll}>🔄 Refresh</button>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {[
          { icon:'💰', label:'Today Revenue', value:`₹${todayRevenue}`,    color:'var(--coral)',  bg:'var(--coral-soft)',  trend:'+12%' },
          { icon:'📋', label:'Total Orders',  value:orders.length,          color:'var(--blue)',   bg:'var(--blue-soft)',   trend:'+5'   },
          { icon:'⚡', label:'Active Now',    value:activeOrders.length,    color:'var(--amber)',  bg:'var(--amber-soft)',  trend:pendingCount  },
          { icon:'✅', label:'Completion',    value:`${completionRate}%`,   color:'var(--mint)',   bg:'var(--mint-soft)',   trend:'Rate' },
        ].map((s, i) => (
          <div key={s.label} className={`stat-card animate-slide-up stagger-${i+1}`}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-trend up">{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { id:'kanban',    label:'📋 Orders'    },
          { id:'menu',      label:'🍽️ Menu'      },
          { id:'activity',  label:'📡 Activity'  },
        ].map(t => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {/* ─── Kanban ─── */}
      {tab === 'kanban' && (
        <div className="kanban">
          {kanbanCols.map(col => {
            const colOrders = orders.filter(o => o.status === col.key);
            return (
              <div key={col.key} className="kanban-col">
                <div className={`kanban-col-header ${col.cls}`}>
                  <span>{col.label}</span>
                  <span className="kanban-count">{colOrders.length}</span>
                </div>
                <div className="kanban-cards">
                  {colOrders.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'32px 8px', color:'var(--text4)', fontSize:'0.82rem' }}>
                      No orders
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <KanbanCard
                        key={order.id}
                        order={order}
                        onAdvance={() => advanceOrder(order.id, order.status)}
                        onCancel={() => cancelOrd(order.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Menu Management ─── */}
      {tab === 'menu' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--s5)' }}>
            <div style={{ fontWeight:700 }}>{menu.length} menu items</div>
            <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)}>
              {showAdd ? '✕ Cancel' : '➕ Add Item'}
            </button>
          </div>

          {/* Add item form */}
          {showAdd && (
            <div className="cart-section" style={{ marginBottom:'var(--s5)' }}>
              <div className="cart-section-title">New Menu Item</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="form-label" htmlFor="new-name">Name *</label>
                  <input id="new-name" className="form-input" placeholder="e.g. Masala Dosa" value={newItem.name} onChange={e => setNewItem(v => ({...v, name:e.target.value}))} />
                </div>
                <div>
                  <label className="form-label" htmlFor="new-price">Price (₹) *</label>
                  <input id="new-price" className="form-input" type="number" placeholder="e.g. 40" value={newItem.price} onChange={e => setNewItem(v => ({...v, price:e.target.value}))} />
                </div>
                <div>
                  <label className="form-label" htmlFor="new-cat">Category *</label>
                  <input id="new-cat" className="form-input" placeholder="e.g. Breakfast" value={newItem.category} onChange={e => setNewItem(v => ({...v, category:e.target.value}))} />
                </div>
                <div>
                  <label className="form-label" htmlFor="new-img">Image URL</label>
                  <input id="new-img" className="form-input" placeholder="https://…" value={newItem.image} onChange={e => setNewItem(v => ({...v, image:e.target.value}))} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop:16 }} onClick={handleAddItem}>Add Item</button>
            </div>
          )}

          <div className="menu-mgmt-grid">
            {menu.map(item => (
              <div key={item.id} className="menu-mgmt-card">
                {item.image
                  ? <img className="menu-mgmt-img" src={item.image} alt={item.name} loading="lazy"
                      onError={e => { e.target.style.display='none'; }} />
                  : <div className="menu-mgmt-img" style={{ display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', background:'var(--surface3)' }}>🍽️</div>
                }
                <div className="menu-mgmt-body">
                  <div className="menu-mgmt-name">{item.name}</div>
                  <div className="menu-mgmt-cat">{item.category}</div>
                  <div className="menu-mgmt-footer">
                    <span className="menu-mgmt-price">₹{item.price}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <label className="toggle-switch" title={item.available ? 'Mark sold out' : 'Mark available'}>
                        <input
                          type="checkbox"
                          checked={!!item.available}
                          onChange={e => toggleItem(item.id, e.target.checked)}
                          aria-label={`Toggle availability of ${item.name}`}
                        />
                        <span className="toggle-slider" />
                      </label>
                      <button
                        onClick={() => deleteItem(item.id, item.name)}
                        style={{ background:'var(--red-soft)', border:'none', color:'var(--red)', borderRadius:8, padding:'4px 10px', fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}
                        aria-label={`Delete ${item.name}`}
                      >Delete</button>
                    </div>
                  </div>
                  <div style={{ fontSize:'0.68rem', color: item.available ? 'var(--mint)' : 'var(--red)', fontWeight:700, marginTop:8 }}>
                    {item.available ? '✅ Available' : '❌ Sold Out'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Activity Feed ─── */}
      {tab === 'activity' && (
        <div>
          <div style={{ fontWeight:700, marginBottom:'var(--s4)' }}>Live Activity Feed</div>
          {activity.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text4)' }}>No activity yet. Events will appear here in real-time.</div>
          ) : (
            <div className="activity-feed">
              {activity.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" style={{ background: `var(--${a.color || 'coral'})` }} />
                  <div className="activity-text">{a.icon} {a.text}</div>
                  <div className="activity-time">{timeAgo(a.time)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Kanban Card ─────────────────────────────────────── */
function KanbanCard({ order, onAdvance, onCancel }) {
  const token = order.token || String(order.id || '').slice(-4);
  const items = (order.items || []).map(i => `${i.name}×${i.qty}`).join(', ');
  const nextStatus = STATUS_FLOW[order.status];

  return (
    <div className="kanban-card animate-slide-down">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div className="kanban-card-token">#{token}</div>
        <div style={{ fontSize:'0.68rem', color:'var(--text3)' }}>{timeAgo(order.placedAt)}</div>
      </div>
      <div className="kanban-card-user">👤 {order.user}</div>
      <div className="kanban-card-items" style={{ fontSize:'0.75rem', color:'var(--text2)', marginBottom:4 }} title={items}>
        {items.length > 60 ? items.slice(0, 60) + '…' : items || 'Order'}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div className="kanban-card-total">₹{order.total}</div>
        <div style={{ fontSize:'0.68rem', color:'var(--text3)' }}>
          {order.payment_method === 'online' ? '💳' : order.payment_method === 'wallet' ? '💰' : '🏪'}
        </div>
      </div>
      <div className="kanban-card-actions">
        {nextStatus && (
          <button className="kanban-action-btn advance" onClick={onAdvance}>
            → {nextStatus}
          </button>
        )}
        {order.status === 'Pending' && (
          <button className="kanban-action-btn cancel" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </div>
  );
}
