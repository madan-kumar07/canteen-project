import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SkeletonFoodCard, QtyCtrl, getRushLevel, getCatConfig, getGreeting, isVegItem, VegDot } from '../utils/ui';
import { getMenu } from '../api';

const BESTSELLER_IDS = ['1','2','5','12','17','20','45','63'];
const OFFERS = [
  { code: 'FIRST50',   title: '50% OFF',    sub: 'On your first order',   badge: '🎉 New User',  variant: '' },
  { code: 'CANTEEN20', title: '20% OFF',    sub: 'On orders above ₹80',   badge: '🔥 Popular',   variant: 'variant-2' },
  { code: 'SAVE15',    title: '15% OFF',    sub: 'On orders above ₹100',  badge: '⚡ Flash Deal', variant: 'variant-3' },
  { code: 'WELCOME10', title: 'FLAT ₹10',   sub: 'Welcome bonus',         badge: '🎁 Gift',       variant: 'variant-4' },
];

export default function HomePage() {
  const { state, dispatch, cartCount, cartTotal, toast, navigate } = useApp();
  const [menu,        setMenu]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [rushInfo,    setRushInfo]    = useState(null);
  const [menuError,   setMenuError]   = useState(false);
  const menuRef = useRef(null);

  /* Fetch menu */
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setMenuError(false);
    try {
      const data = await getMenu();
      setMenu(Array.isArray(data) ? data : []);
    } catch {
      setMenuError(true);
      toast('error', 'Menu unavailable', 'Could not load menu. Retrying…');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  /* Real-time menu updates */
  useEffect(() => {
    const onItemUpdate = (e) => {
      const { id, available, name } = e.detail;
      setMenu(prev => prev.map(item =>
        String(item.id) === String(id) ? { ...item, available } : item
      ));
    };
    const onFullRefresh = (e) => {
      if (Array.isArray(e.detail)) setMenu(e.detail);
    };
    window.addEventListener('menu_item_updated', onItemUpdate);
    window.addEventListener('menu_full_refresh', onFullRefresh);
    return () => {
      window.removeEventListener('menu_item_updated', onItemUpdate);
      window.removeEventListener('menu_full_refresh', onFullRefresh);
    };
  }, []);

  /* Rush indicator */
  useEffect(() => {
    const pendingCount = menu.filter(i => !i.available).length;
    setRushInfo(getRushLevel(pendingCount));
  }, [menu]);

  /* Categories */
  const categories = ['All', ...new Set(menu.map(i => i.category).filter(Boolean))];

  const filteredMenu = activeCategory === 'All'
    ? menu
    : menu.filter(i => i.category === activeCategory);

  /* Cart helpers */
  const getQty  = (id) => state.cart.find(c => String(c.id) === String(id))?.qty || 0;
  const addItem = (item) => { dispatch({ type: 'ADD_TO_CART', payload: { item } }); };
  const remItem = (id)   => { dispatch({ type: 'REMOVE_FROM_CART', payload: id }); };

  /* Trending = available items sorted (mock by ID order for now) */
  const trendingItems = menu.filter(i => i.available).slice(0, 8);

  /* Recent orders */
  const recentOrders = state.orderHistory.slice(0, 3);

  /* Scroll to category */
  const scrollToCat = (cat) => {
    setActiveCategory(cat);
    if (cat !== 'All') {
      const el = document.getElementById(`cat-${cat.replace(/\s+/g, '-')}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="page-pad">
      {/* ── Hero ── */}
      <div className="home-hero">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div className="hero-greeting" aria-label="Greeting">
              {getGreeting()}, {state.user?.username || 'Guest'} 👋
            </div>
            <h1 className="hero-title">
              What are you<br /><span>craving today?</span>
            </h1>
            <p className="hero-sub">
              {loading
                ? 'Loading fresh menu…'
                : `${menu.filter(i => i.available).length} items available now`}
            </p>
            {rushInfo && (
              <div
                className="rush-pill"
                style={{ color: rushInfo.color, borderColor: rushInfo.borderColor }}
                aria-label={`${rushInfo.label} — estimated ${rushInfo.eta}`}
              >
                <span className="rush-dot" style={{ background: rushInfo.dotColor }} />
                {rushInfo.label} · Est. {rushInfo.eta}
              </div>
            )}
          </div>
          <div style={{ fontSize: '5rem', animation: 'float 3s ease-in-out infinite', opacity: 0.9 }} aria-hidden="true">🍽️</div>
        </div>

        {/* Search */}
        <button
          className="hero-search"
          onClick={() => navigate('search')}
          aria-label="Search for food"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="hero-search-text">Search dishes, snacks, beverages…</span>
          <span className="hero-search-shortcut">Tap</span>
        </button>
      </div>

      <div style={{ padding: '0 var(--s5)' }}>

        {/* ── Offer Banners ── */}
        <div style={{ marginBottom: 'var(--s6)' }}>
          <div className="section-head">
            <div>
              <div className="section-title">🎁 Offers & Deals</div>
              <div className="section-subtitle">Exclusive for you today</div>
            </div>
          </div>
        </div>
      </div>
      <div className="offers-scroll" style={{ paddingLeft: 'var(--s5)', paddingRight: 'var(--s5)' }}>
        {OFFERS.map((offer, i) => (
          <div
            key={offer.code}
            className={`offer-card ${offer.variant} animate-slide-up stagger-${i + 1}`}
            onClick={() => {
              dispatch({ type: 'APPLY_PROMO', payload: offer.code });
              navigate('cart');
              toast('success', `${offer.code} Applied!`, offer.sub);
            }}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            aria-label={`Apply ${offer.code}: ${offer.title} — ${offer.sub}`}
          >
            <div className="offer-badge">{offer.badge}</div>
            <div className="offer-title">{offer.title}</div>
            <div className="offer-sub">{offer.sub}</div>
            <div className="offer-code">{offer.code}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 var(--s5)' }}>

        {/* ── Quick Reorder ── */}
        {recentOrders.length > 0 && (
          <div style={{ marginTop: 'var(--s7)' }}>
            <div className="section-head">
              <div>
                <div className="section-title">⚡ Quick Reorder</div>
                <div className="section-subtitle">Pick up from where you left off</div>
              </div>
              <button className="section-action" onClick={() => navigate('orders')}>See all</button>
            </div>
            <div className="h-scroll">
              {recentOrders.map((order, i) => (
                <div
                  key={order.id || i}
                  className={`reorder-card animate-slide-up stagger-${i + 1}`}
                  onClick={() => {
                    order.items?.forEach(item => {
                      for (let q = 0; q < (item.qty || 1); q++) {
                        dispatch({ type: 'ADD_TO_CART', payload: { item } });
                      }
                    });
                    toast('order', '🔄 Reordered!', `${order.items?.length || 0} items added to cart`);
                    navigate('cart');
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Reorder: ${order.items?.map(i => i.name).join(', ')}`}
                >
                  <div className="reorder-tag">Order #{order.token || String(order.id || '').slice(-4)}</div>
                  <div className="reorder-items">
                    {order.items?.map(i => i.name).join(', ') || 'Previous order'}
                  </div>
                  <div className="reorder-meta">
                    <span className="reorder-price">₹{order.total || 0}</span>
                    <button className="reorder-btn" onClick={e => e.stopPropagation()}>🔄 Reorder</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Trending Now ── */}
        {!loading && trendingItems.length > 0 && (
          <div style={{ marginTop: 'var(--s7)' }}>
            <div className="section-head">
              <div>
                <div className="section-title">🔥 Trending Now</div>
                <div className="section-subtitle">Most loved by students today</div>
              </div>
            </div>
            <div className="h-scroll">
              {trendingItems.map((item, i) => {
                const qty = getQty(item.id);
                return (
                  <div key={item.id} className={`trending-card animate-slide-up stagger-${(i % 6) + 1}`}>
                    {item.image
                      ? <img className="trending-card-img" src={item.image} alt={item.name} loading="lazy"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      : null}
                    <div className="trending-card-img-ph" style={{ display: item.image ? 'none' : 'flex' }}>
                      {getCatConfig(item.category).emoji}
                    </div>
                    <div className="trending-card-body">
                      <div className="trending-card-tag">🔥 Trending</div>
                      <div className="trending-card-name">{item.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <span className="trending-card-price">₹{item.price}</span>
                        {item.available
                          ? qty > 0
                            ? <QtyCtrl qty={qty} onAdd={() => addItem(item)} onRemove={() => remItem(item.id)} size="sm" />
                            : <button className="add-btn" onClick={() => addItem(item)} style={{ fontSize: '0.72rem', padding: '5px 12px' }}>+ Add</button>
                          : <span className="add-btn-unavail">Sold out</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Category Scroll ── */}
        {!loading && (
          <div style={{ marginTop: 'var(--s7)' }}>
            <div className="section-head">
              <div className="section-title">🗂️ Browse by Category</div>
            </div>
            <div className="cat-scroll" role="list" aria-label="Categories">
              {categories.map(cat => {
                const cfg = getCatConfig(cat);
                return (
                  <div
                    key={cat}
                    className={`cat-card ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => scrollToCat(cat)}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && scrollToCat(cat)}
                    aria-pressed={activeCategory === cat}
                    aria-label={cat}
                  >
                    <div className="cat-emoji-wrap" style={{ background: cfg.bg }}>
                      {cat === 'All' ? '✨' : cfg.emoji}
                    </div>
                    <div className="cat-name">{cat}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Category Tabs ── */}
      {!loading && categories.length > 1 && (
        <div className="cat-tabs-wrap" role="navigation" aria-label="Category filter">
          <div className="cat-tabs" role="tablist">
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => scrollToCat(cat)}
                role="tab"
                aria-selected={activeCategory === cat}
              >
                {getCatConfig(cat).emoji} {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Food List ── */}
      <div style={{ padding: '0 var(--s5)', marginTop: 'var(--s4)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array(6).fill(0).map((_, i) => <SkeletonFoodCard key={i} />)}
          </div>
        ) : menuError ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Could not load menu</div>
            <button className="btn btn-primary" onClick={fetchMenu}>Retry</button>
          </div>
        ) : filteredMenu.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🍽️</div>
            <div style={{ fontWeight: 700 }}>No items in this category</div>
          </div>
        ) : activeCategory === 'All' ? (
          /* Group by category */
          categories.filter(c => c !== 'All').map(cat => {
            const catItems = menu.filter(i => i.category === cat);
            if (!catItems.length) return null;
            const cfg = getCatConfig(cat);
            return (
              <div
                key={cat}
                id={`cat-${cat.replace(/\s+/g, '-')}`}
                className="cat-section"
              >
                <div className="cat-section-head">
                  <div className="cat-section-emoji" style={{ background: cfg.bg }}>{cfg.emoji}</div>
                  <div>
                    <div className="cat-section-title">{cat}</div>
                    <div className="cat-section-sub">
                      {catItems.filter(i => i.available).length} available
                      {catItems.filter(i => !i.available).length > 0 && ` · ${catItems.filter(i => !i.available).length} sold out`}
                    </div>
                  </div>
                </div>
                <div className="food-grid">
                  {catItems.map(item => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      qty={getQty(item.id)}
                      onAdd={() => addItem(item)}
                      onRemove={() => remItem(item.id)}
                      isFav={state.favorites.includes(String(item.id))}
                      onFav={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: String(item.id) })}
                      isBestseller={BESTSELLER_IDS.includes(String(item.id))}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="food-grid">
            {filteredMenu.map(item => (
              <FoodCard
                key={item.id}
                item={item}
                qty={getQty(item.id)}
                onAdd={() => addItem(item)}
                onRemove={() => remItem(item.id)}
                isFav={state.favorites.includes(String(item.id))}
                onFav={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: String(item.id) })}
                isBestseller={BESTSELLER_IDS.includes(String(item.id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Cart ── */}
      {cartCount > 0 && (
        <div className="floating-cart" aria-live="polite">
          <button
            className="floating-cart-btn"
            onClick={() => navigate('cart')}
            aria-label={`View cart: ${cartCount} items, total ₹${cartTotal}`}
          >
            <span>🛒</span>
            <span className="floating-cart-count">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
            <span style={{ flex: 1 }}>View Cart</span>
            <span className="floating-cart-total">₹{cartTotal}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── FoodCard Component ─────────────────────────────── */
function FoodCard({ item, qty, onAdd, onRemove, isFav, onFav, isBestseller }) {
  const isVeg = isVegItem(item);
  const rating = (3.5 + (parseInt(item.id, 10) % 15) * 0.1).toFixed(1);

  return (
    <article
      className={`food-card animate-fade-in ${!item.available ? 'sold-out' : ''}`}
      aria-label={`${item.name}, ₹${item.price}${!item.available ? ', sold out' : ''}`}
    >
      {/* Body */}
      <div className="food-card-body">
        <div className="food-card-badges">
          <VegDot isVeg={isVeg} />
          {isBestseller && <span className="fc-badge best">⭐ Bestseller</span>}
          {!item.available && <span className="fc-badge sold-out-b">Sold Out</span>}
        </div>

        <div className="food-card-name">{item.name}</div>

        <div className="food-card-meta">
          <span className="fc-rating">★ {rating}</span>
          <span className="fc-dot" />
          <span>{item.category}</span>
        </div>

        <div className="food-card-bottom">
          <div className="food-card-price">₹{item.price}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="fav-btn"
              onClick={onFav}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFav}
              style={{ position: 'static', width: 30, height: 30 }}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
            {item.available
              ? qty > 0
                ? <QtyCtrl qty={qty} onAdd={onAdd} onRemove={onRemove} />
                : <button className="add-btn" onClick={onAdd} aria-label={`Add ${item.name}`}>+ Add</button>
              : <span className="add-btn-unavail">Unavailable</span>
            }
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="food-card-img-wrap">
        {item.image
          ? <img
              className="food-card-img"
              src={item.image}
              alt={item.name}
              loading="lazy"
              onError={e => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          : null}
        <div className="food-card-img-ph" style={{ display: item.image ? 'none' : 'flex' }}>
          {getCatConfig(item.category).emoji}
        </div>
        {!item.available && (
          <div className="sold-out-overlay">
            <span className="sold-out-label">SOLD OUT</span>
          </div>
        )}
      </div>
    </article>
  );
}
