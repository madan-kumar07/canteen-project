import React, { useState } from 'react';
import { updateOrderStatus } from '../api';

/* Status config */
const STATUS_COLOR = { Pending:'#f9a825', Preparing:'#60a5fa', Ready:'#48c479', Completed:'#6e6e6e' };
const NEXT  = { Pending:'Preparing', Preparing:'Ready', Ready:'Completed' };
const LABEL = { Pending:'▶ Start', Preparing:'✓ Ready', Ready:'📦 Complete' };

/* ── Compact Order Row ── */
function OrderRow({ order, onStatus, onView }) {
  const color = STATUS_COLOR[order.status] || '#999';
  return (
    <div className="om-row">
      <div className="om-token" style={{ color: 'var(--orange)' }}>#{order.token_number}</div>
      <div className="om-items">
        {order.items.map((it, i) => (
          <span key={i} className="om-item-chip">{it.quantity}× {it.name}</span>
        ))}
      </div>
      <div className="om-pickup">{order.pickup_time}</div>
      <div className="om-price">₹{order.total_price}</div>
      <div className="om-status-badge" style={{ background:`${color}20`, color }}>
        {order.status}
      </div>
      <div className="om-actions">
        <button className="om-view-btn" onClick={() => onView(order)}>📄</button>
        {NEXT[order.status] && (
          <button
            className="om-next-btn"
            style={{ background:`${STATUS_COLOR[NEXT[order.status]]}20`, color: STATUS_COLOR[NEXT[order.status]] }}
            onClick={() => onStatus(order.order_id, NEXT[order.status])}
          >
            {LABEL[order.status]}
          </button>
        )}
        {order.status === 'Completed' && (
          <span style={{ fontSize:'0.75rem', color:'var(--green)', fontWeight:600 }}>✓ Done</span>
        )}
      </div>
    </div>
  );
}

/* ── MAIN OrdersTab ── */
export default function OrdersTab({ orders, onRefresh, onView }) {
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');
  const [sort,    setSort]    = useState('token'); // token | time | price
  const [view,    setView]    = useState('kanban'); // kanban | list
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 10;

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    onRefresh();
  };

  /* Filter */
  const filtered = orders.filter(o => {
    const matchStatus = filter === 'All' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      String(o.token_number).includes(q) ||
      o.order_id.toLowerCase().includes(q) ||
      o.items.some(it => it.name.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  /* Sort */
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'token') return a.token_number - b.token_number;
    if (sort === 'price') return b.total_price - a.total_price;
    return b.timestamp - a.timestamp;
  });

  /* Pagination (list view only) */
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* Kanban groups */
  const byStatus = s => sorted.filter(o => o.status === s);

  const STATUSES = ['All', 'Pending', 'Preparing', 'Ready', 'Completed'];

  return (
    <div className="om-wrap">
      {/* ── Toolbar ── */}
      <div className="om-toolbar">
        <div className="om-search-wrap">
          <span className="om-search-icon">🔍</span>
          <input
            className="om-search"
            placeholder="Search token, order ID, item…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && <button className="om-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          <select className="om-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="token">Sort: Token #</option>
            <option value="time">Sort: Latest</option>
            <option value="price">Sort: Price ↓</option>
          </select>
          <div className="om-view-toggle">
            <button className={`om-vbtn ${view==='kanban'?'active':''}`} onClick={() => setView('kanban')} title="Kanban">⠿</button>
            <button className={`om-vbtn ${view==='list'?'active':''}`}   onClick={() => setView('list')}   title="List">≡</button>
          </div>
        </div>
      </div>

      {/* ── Status Filters ── */}
      <div className="om-filters">
        {STATUSES.map(s => {
          const count = s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              className={`om-filter-btn ${filter===s?'active':''}`}
              style={filter===s && s!=='All' ? { background:`${STATUS_COLOR[s]}22`, borderColor:STATUS_COLOR[s], color:STATUS_COLOR[s] } : {}}
              onClick={() => { setFilter(s); setPage(1); }}
            >
              {s} <span className="om-filter-count">{count}</span>
            </button>
          );
        })}
        <span className="om-total-label">{filtered.length} orders shown</span>
      </div>

      {/* ── KANBAN VIEW ── */}
      {view === 'kanban' && (
        <div className="kanban-board">
          {['Pending','Preparing','Ready','Completed'].map(s => {
            const col = byStatus(s);
            const color = STATUS_COLOR[s];
            const EMOJI = { Pending:'🟡', Preparing:'🔵', Ready:'🟢', Completed:'✅' };
            return (
              <div key={s} className="kanban-col">
                <div className="kanban-col-head" style={{ borderTopColor: color }}>
                  <span>{EMOJI[s]} {s}</span>
                  <span className="kanban-count" style={{ background:`${color}22`, color }}>{col.length}</span>
                </div>
                <div className="kanban-col-body">
                  {col.length === 0 ? <div className="kanban-empty">No orders</div> :
                    col.map(o => (
                      <div key={o.order_id} className="order-card">
                        <div className="oc-token-row">
                          <div className="oc-token">#{o.token_number}</div>
                          <span className={`oc-status ${o.status.toLowerCase()}`}>{o.status}</span>
                        </div>
                        <div className="oc-items">
                          {o.items.map((it,i) => (
                            <div key={i} className="oc-item-row">
                              <span className="oc-item-qty">{it.quantity}×</span>
                              <span className="oc-item-name">{it.name}</span>
                              <span className="oc-item-price">₹{it.price*it.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="oc-meta"><span>🕐 {o.pickup_time}</span><span style={{fontWeight:700,color:'var(--orange)'}}>₹{o.total_price}</span></div>
                        <div className="oc-actions">
                          <button className="oc-qr-btn" onClick={() => onView(o)}>📄 View</button>
                          {NEXT[o.status] && (
                            <button className={`oc-action-btn ${s==='Pending'?'obtn-start':s==='Preparing'?'obtn-ready':'obtn-deliver'}`}
                              onClick={() => handleStatus(o.order_id, NEXT[o.status])}>
                              {LABEL[o.status]}
                            </button>
                          )}
                          {o.status==='Completed' && <span style={{fontSize:'0.8rem',color:'var(--green)',fontWeight:600}}>✓ Done</span>}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="om-list-wrap">
          {/* Header row */}
          <div className="om-list-header">
            <span>Token</span>
            <span>Items</span>
            <span>Pickup</span>
            <span>Total</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {paginated.length === 0 ? (
            <div className="om-empty">
              <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>📋</div>
              <p>No orders match your search</p>
            </div>
          ) : (
            paginated.map(o => <OrderRow key={o.order_id} order={o} onStatus={handleStatus} onView={onView} />)
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="om-pagination">
              <button className="om-page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
              <div className="om-page-nums">
                {Array.from({length: totalPages}, (_,i) => i+1).map(n => (
                  <button
                    key={n}
                    className={`om-page-num ${page===n?'active':''}`}
                    onClick={() => setPage(n)}
                  >{n}</button>
                ))}
              </div>
              <button className="om-page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
