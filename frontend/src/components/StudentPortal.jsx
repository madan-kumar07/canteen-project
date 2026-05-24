import React, { useState, useEffect, useRef } from 'react';
import { getMenu, getRecommendations, placeOrder, getQueue } from '../api';
import OrderTracker from './OrderTracker';
import CartPage from './CartPage';

/* ── constants ── */
const CATEGORY_META = {
  'Morning Snacks': { emoji:'☕', color:'#f59e0b', desc:'10:00 AM' },
  'Lunch':          { emoji:'🍱', color:'#3b82f6', desc:'11:30 AM – 3:30 PM' },
  'Chaat Items':    { emoji:'🥗', color:'#10b981', desc:'4:00 PM' },
  'Snacks':         { emoji:'🍟', color:'#ec4899', desc:'4:00 PM' },
  'Fresh Juices':   { emoji:'🥤', color:'#06b6d4', desc:'4:00 PM' },
  'Soup Items':     { emoji:'🍲', color:'#8b5cf6', desc:'4:00 PM' },
  'Night':          { emoji:'🌙', color:'#6366f1', desc:'Dinner' },
  'Starters':       { emoji:'🍗', color:'#ef4444', desc:'12:00 PM' },
};
const NON_VEG = ['chicken','egg','mutton','fish','prawn','lolipop','wings','boneless','chettinad'];
const isNV    = n => NON_VEG.some(k => n.toLowerCase().includes(k));
const BEST    = new Set(['13','14','17','18','60','63']);
const SPICY   = new Set(['50','51','53','54','14','62']);
const rating  = id => (3.8 + (parseInt(id) % 12) * 0.1).toFixed(1);
const orders  = id => 50 + (parseInt(id) % 20) * 15;

/* ── VegDot ── */
function VegDot({ name }) {
  const nv = isNV(name);
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:16, height:16, borderRadius:3, flexShrink:0,
      border:`2px solid ${nv ? '#e23744' : '#48c479'}`
    }}>
      <span style={{width:7, height:7, borderRadius:'50%', background: nv ? '#e23744' : '#48c479'}} />
    </span>
  );
}

/* ── Food Card ── */
function FoodCard({ item, qty, onAdd, onDec }) {
  const [imgErr, setImgErr] = useState(false);
  const meta    = CATEGORY_META[item.category] || {};
  const soldOut = item.available === false;
  return (
    <div className={`fc ${soldOut ? 'fc-soldout' : ''}`}>
      <div className="fc-info">
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
          <VegDot name={item.name} />
          {soldOut && <span className="fc-badge soldout">🚫 Sold Out</span>}
          {!soldOut && BEST.has(item.id)  && <span className="fc-badge best">🏆 Bestseller</span>}
          {!soldOut && SPICY.has(item.id) && <span className="fc-badge spicy">🌶 Spicy</span>}
        </div>
        <div className="fc-name" style={soldOut?{color:'var(--text3)'}:{}}>{item.name}</div>
        <div className="fc-price" style={soldOut?{color:'var(--text3)'}:{}}>{soldOut ? '—' : `₹${item.price}`}</div>
        <div className="fc-meta">
          <span style={{color:'#f9a825'}}>★</span> {rating(item.id)}
          <span className="fc-dot" /> {orders(item.id)}+ orders
        </div>
        <div className="fc-cat-tag" style={{color: meta.color || 'var(--text3)'}}>
          {meta.emoji} {item.category}
        </div>
      </div>
      <div className="fc-right">
        {imgErr
          ? <div className={`fc-img-ph ${soldOut?'fc-img-ph-dim':''}`}>{meta.emoji || '🍽️'}</div>
          : <img className={`fc-img ${soldOut?'fc-img-dim':''}`} src={item.image} alt={item.name} onError={() => setImgErr(true)} />
        }
        <div className="fc-add-wrap">
          {soldOut ? (
            <div className="fc-soldout-btn">Not Available</div>
          ) : qty === 0 ? (
            <button className="fc-add" onClick={() => onAdd(item)}>ADD <span style={{fontSize:'1rem'}}>+</span></button>
          ) : (
            <div className="fc-qty">
              <button className="fc-qbtn" onClick={() => onDec(item.id)}>−</button>
              <span className="fc-qnum">{qty}</span>
              <button className="fc-qbtn" onClick={() => onAdd(item)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Special Card ── */
function SpecialCard({ item, qty, onAdd, onDec }) {
  const [imgErr, setImgErr] = useState(false);
  const m = CATEGORY_META[item.category] || {};
  const soldOut = item.available === false;
  return (
    <div className={`sp-special-card ${soldOut?'sp-special-soldout':''}`}>
      <div className="sp-special-img-wrap">
        {imgErr
          ? <div className="sp-special-ph">{m.emoji}</div>
          : <img src={item.image} alt={item.name} className="sp-special-img"
              style={soldOut?{filter:'grayscale(1)',opacity:0.5}:{}} onError={() => setImgErr(true)} />
        }
        {soldOut
          ? <span className="sp-special-tag" style={{background:'rgba(226,55,68,0.85)',color:'white'}}>🚫 Sold Out</span>
          : <span className="sp-special-tag">🏆 Best</span>
        }
      </div>
      <div className="sp-special-body">
        <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:3}}>
          <VegDot name={item.name} />
          <span className="sp-special-name" style={soldOut?{color:'var(--text3)'}:{}}>{item.name}</span>
        </div>
        <div className="sp-special-price" style={soldOut?{color:'var(--text3)'}:{}}>{soldOut ? 'Unavailable' : `₹${item.price}`}</div>
        <div style={{marginTop:8}}>
          {soldOut ? (
            <div className="fc-soldout-btn" style={{fontSize:'0.78rem', padding:'0.4rem'}}>Sold Out</div>
          ) : qty === 0 ? (
            <button className="sp-special-add" onClick={() => onAdd(item)}>ADD +</button>
          ) : (
            <div className="fc-qty" style={{width:'100%'}}>
              <button className="fc-qbtn" onClick={() => onDec(item.id)}>−</button>
              <span className="fc-qnum">{qty}</span>
              <button className="fc-qbtn" onClick={() => onAdd(item)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Order History Card ── */
const STATUS_COLOR = { Pending:'#f9a825', Preparing:'#60a5fa', Ready:'#48c479', Completed:'#48c479', Cancelled:'#e23744' };
const STATUS_ICON  = { Pending:'🕐', Preparing:'👨‍🍳', Ready:'🔔', Completed:'✅', Cancelled:'❌' };

function OrderHistoryCard({ order }) {
  const [liveStatus, setLiveStatus] = useState(order.status);
  const color = STATUS_COLOR[liveStatus] || '#999';

  useEffect(() => {
    if (!order.order_id || liveStatus === 'Completed') return;
    const poll = async () => {
      try {
        const { getOrder } = await import('../api');
        const res = await getOrder(order.order_id);
        if (res.data?.status) setLiveStatus(res.data.status);
      } catch {}
    };
    const t = setInterval(poll, 5000);
    poll();
    return () => clearInterval(t);
  }, [order.order_id]);

  return (
    <div className="oh-card">
      <div className="oh-card-top">
        <div className="oh-token">#{order.token_number}</div>
        <div className="oh-status" style={{color, background:`${color}15`}}>
          {STATUS_ICON[liveStatus]} {liveStatus}
        </div>
      </div>
      <div className="oh-items">
        {order.items?.map((it, i) => (
          <span key={i} className="oh-item-chip">{it.quantity}× {it.name}</span>
        ))}
      </div>
      <div className="oh-card-foot">
        <div className="oh-meta">
          <span>🕐 {order.pickup_time}</span>
          <span className="oh-dot" />
          <span className="oh-oid">{order.order_id}</span>
        </div>
        <div className="oh-total">₹{order.total_price}</div>
      </div>
      {liveStatus === 'Ready' && (
        <div className="oh-ready-banner">🔔 Your order is READY! Go collect at the counter.</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN STUDENT PORTAL
══════════════════════════════════════ */
export default function StudentPortal({ user, cart, addToCart, removeFromCart, clearCart, view, setView }) {
  const [menu,      setMenu]      = useState([]);
  const [queue,     setQueue]     = useState({});
  const [recs,      setRecs]      = useState([]);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('All');
  const [activeCat, setActive]    = useState('');
  const [order,     setOrder]     = useState(null);
  const [history,   setHistory]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('sc_order_history') || '[]'); } catch { return []; }
  });
  const sectionRefs = useRef({});

  const goTo = (v) => { setView(v); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  useEffect(() => {
    getMenu().then(r => { setMenu(r.data); if (r.data[0]) setActive(r.data[0].category); }).catch(() => {});
    getQueue().then(r => setQueue(r.data)).catch(() => {});
    const t = setInterval(() => getQueue().then(r => setQueue(r.data)).catch(() => {}), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (cart.length) getRecommendations(cart).then(r => setRecs(r.data)).catch(() => {});
    else setRecs([]);
  }, [cart]);

  const categories = [...new Set(menu.map(i => i.category))];
  const cartTotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount  = cart.reduce((s, i) => s + i.quantity, 0);
  const getQty     = id => cart.find(i => i.id === id)?.quantity ?? 0;
  const handleDec  = id => removeFromCart(id);

  const filtered = items => items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'Veg'       ? !isNV(i.name) :
      filter === 'Non-Veg'   ? isNV(i.name)  :
      filter === 'Under ₹30' ? i.price <= 30 :
      filter === 'Under ₹60' ? i.price <= 60 : true;
    return matchSearch && matchFilter;
  });

  const scrollTo = cat => {
    setActive(cat);
    sectionRefs.current[cat]?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  const handlePlaceOrder = async (pickup, finalTotal) => {
    try {
      const r = await placeOrder({ items: cart, total_price: finalTotal, pickup_time: pickup });
      const newOrder = r.data;
      // Save to history
      const updated = [newOrder, ...history].slice(0, 20); // keep last 20
      setHistory(updated);
      localStorage.setItem('sc_order_history', JSON.stringify(updated));
      setOrder(newOrder);
      clearCart();
      goTo('menu');
    } catch { alert('Order failed. Is backend running?'); }
  };

  const rushColor = queue.rush_meter === 'High Rush' ? '#e23744' : queue.rush_meter === 'Medium Rush' ? '#f9a825' : '#48c479';

  /* ORDER TRACKER */
  if (order) return (
    <div style={{maxWidth:700, margin:'0 auto', padding:'1.5rem'}}>
      <OrderTracker order={order} onDismiss={() => setOrder(null)} />
    </div>
  );

  /* CART PAGE */
  if (view === 'cart') return (
    <CartPage
      cart={cart}
      recs={recs}
      addToCart={addToCart}
      removeFromCart={removeFromCart}
      clearCart={clearCart}
      onPlaceOrder={handlePlaceOrder}
      onBack={() => goTo('menu')}
    />
  );

  /* MY ORDERS PAGE */
  if (view === 'orders') return (
    <div className="sp-page animate-fade-in">
      <div className="oh-header">
        <button className="cp-back" onClick={() => goTo('menu')}>← Menu</button>
        <div className="cp-header-center">
          <h1 className="cp-title">My Orders</h1>
          <p className="cp-subtitle">{history.length} order{history.length !== 1 ? 's' : ''} placed</p>
        </div>
        <button className="cp-clear-btn" onClick={() => { if(window.confirm('Clear order history?')) { setHistory([]); localStorage.removeItem('sc_order_history'); } }}>
          Clear
        </button>
      </div>

      <div className="oh-body">
        {history.length === 0 ? (
          <div className="oh-empty">
            <div style={{fontSize:'4rem',marginBottom:'1rem'}}>📋</div>
            <h3>No orders yet</h3>
            <p style={{color:'var(--text2)',marginBottom:'1.5rem'}}>Your order history will appear here</p>
            <button className="cp-back-btn" onClick={() => goTo('menu')}>Browse Menu →</button>
          </div>
        ) : (
          history.map((o, idx) => (
            <OrderHistoryCard key={o.order_id || idx} order={o} />
          ))
        )}
      </div>
    </div>
  );

  /* MENU PAGE */
  return (
    <div className="sp-page animate-fade-in">

      {/* ── HERO ── */}
      <div className="sp-hero">
        <div className="sp-hero-left">
          <div className="sp-greeting">👋 Hey, {user?.name?.split(' ')[0] || 'Student'}!</div>
          <h1 className="sp-hero-title">What would you like<br/>to eat <span>today?</span></h1>
          <p className="sp-hero-sub">JJ College Food Court · Pre-order &amp; skip the queue</p>
          <div className="sp-rush-pill" style={{borderColor: rushColor, color: rushColor}}>
            <span className="sp-rush-dot" style={{background: rushColor}} />
            {queue.rush_meter || 'Checking...'} &nbsp;·&nbsp;
            {queue.rush_meter === 'High Rush' ? 'Est. 15–20 min' : queue.rush_meter === 'Medium Rush' ? 'Est. 5–10 min' : 'No queue!'}
          </div>
        </div>
        <div className="sp-hero-art">🍽️</div>
      </div>

      {/* ── SEARCH ── */}
      <div className="sp-search-row">
        <div className="sp-search-wrap">
          <span className="sp-search-icon">🔍</span>
          <input
            className="sp-search"
            placeholder="Search items... (e.g. Biryani, Dosai)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="sp-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {/* ── FILTER CHIPS ── */}
      <div className="sp-filters">
        {['All','Veg','Non-Veg','Under ₹30','Under ₹60'].map(f => (
          <button key={f} className={`sp-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'Veg' ? '🟢 Veg' : f === 'Non-Veg' ? '🔴 Non-Veg' : f}
          </button>
        ))}
      </div>

      {/* ── CATEGORY QUICK SCROLL ── */}
      {!search && filter === 'All' && (
        <div className="sp-cat-scroll">
          {categories.map(cat => {
            const m = CATEGORY_META[cat] || {};
            return (
              <button key={cat} className={`sp-cat-card ${activeCat === cat ? 'active' : ''}`} onClick={() => scrollTo(cat)}>
                <div className="sp-cat-emoji" style={{background:`${m.color||'#666'}22`}}>{m.emoji || '🍴'}</div>
                <div className="sp-cat-name">{cat}</div>
                <div className="sp-cat-time">{m.desc || ''}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── STICKY CATEGORY TABS ── */}
      <div className="cat-tabs-wrapper">
        <div className="cat-tabs">
          {categories.map(cat => (
            <button key={cat} className={`cat-tab ${activeCat === cat ? 'active' : ''}`} onClick={() => scrollTo(cat)}>
              {CATEGORY_META[cat]?.emoji} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── MENU CONTENT ── */}
      <div className="sp-menu-content">

        {/* Today's Special */}
        {!search && filter === 'All' && (
          <div className="sp-special-section">
            <div className="sp-section-head">
              <span>⚡ Today's Special</span>
              <span className="sp-section-badge">Hot picks</span>
            </div>
            <div className="sp-special-grid">
              {menu.filter(i => BEST.has(i.id)).slice(0, 4).map(item => (
                <SpecialCard key={item.id} item={item} qty={getQty(item.id)} onAdd={addToCart} onDec={handleDec} />
              ))}
            </div>
          </div>
        )}

        {/* All Category Sections */}
        {categories.map(cat => {
          const items = filtered(menu.filter(i => i.category === cat));
          if (!items.length) return null;
          const m = CATEGORY_META[cat] || {};
          return (
            <div key={cat} className="cat-section" ref={el => sectionRefs.current[cat] = el}>
              <div className="sp-cat-head">
                <span className="sp-cat-head-emoji" style={{background:`${m.color||'#666'}22`}}>{m.emoji}</span>
                <div>
                  <div className="sp-cat-head-title">{cat}</div>
                  <div className="sp-cat-head-sub">{m.desc} · {items.length} items</div>
                </div>
              </div>
              <div className="food-cards">
                {items.map(item => (
                  <FoodCard key={item.id} item={item} qty={getQty(item.id)} onAdd={addToCart} onDec={handleDec} />
                ))}
              </div>
            </div>
          );
        })}

        {/* No results */}
        {categories.every(cat => filtered(menu.filter(i => i.category === cat)).length === 0) && (
          <div style={{textAlign:'center', padding:'4rem 2rem', color:'var(--text3)'}}>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🔍</div>
            <p style={{fontWeight:600, color:'var(--text2)'}}>No items found for "{search}"</p>
            <button className="sp-filter active" style={{marginTop:'1rem'}} onClick={() => { setSearch(''); setFilter('All'); }}>
              Clear Filters
            </button>
          </div>
        )}
        <div style={{height:'8rem'}} />
      </div>

      {/* ── No bottom FABs — cart is in navbar ── */}
    </div>
  );
}
