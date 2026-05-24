import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useSocket } from '../context/SocketContext';
import { timeAgo } from '../utils/ui';

export default function Navbar({ onSearch }) {
  const { state, dispatch, cartCount, unreadNotifs, navigate } = useApp();
  const { connected, quality } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => dispatch({ type: 'MARK_ALL_READ' });
  const isAdmin = state.user?.role === 'admin';

  const qualityDot = {
    good:    { color: 'var(--mint)',  title: 'Connected' },
    slow:    { color: 'var(--amber)', title: 'Slow connection' },
    offline: { color: 'var(--red)',   title: 'Disconnected' },
  }[quality] || { color: 'var(--red)', title: 'Offline' };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <button
        className="navbar-logo"
        onClick={() => navigate(isAdmin ? 'admin' : 'home')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        aria-label="SmartCanteen Home"
      >
        <div className="navbar-logo-icon" aria-hidden="true">🍽️</div>
        <span className="navbar-logo-text">
          Smart<span>Canteen</span>
        </span>
      </button>

      {/* Search pill — center */}
      {!isAdmin && (
        <button
          className="navbar-search-pill"
          onClick={onSearch}
          aria-label="Search menu"
        >
          <SearchIcon />
          <span>Search dishes, snacks...</span>
        </button>
      )}

      {/* Right actions */}
      <div className="navbar-right">
        {/* Connection quality */}
        <div
          className="socket-dot"
          style={{ background: qualityDot.color, boxShadow: `0 0 8px ${qualityDot.color}` }}
          title={qualityDot.title}
        />

        {/* Search (mobile) */}
        {!isAdmin && (
          <button
            className="nav-icon-btn"
            onClick={onSearch}
            aria-label="Search"
            style={{ display: 'none' }}
            id="mobile-search-btn"
          >
            <SearchIcon />
          </button>
        )}

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="nav-icon-btn"
            onClick={() => { setShowNotifs(v => !v); markAllRead(); }}
            aria-label={`Notifications${unreadNotifs > 0 ? ` (${unreadNotifs} unread)` : ''}`}
            aria-expanded={showNotifs}
          >
            <BellIcon />
            {unreadNotifs > 0 && (
              <span className="nav-badge" aria-label={`${unreadNotifs} unread notifications`}>
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="notif-dropdown" role="menu" aria-label="Notifications">
              <div className="notif-header">
                <span>Notifications</span>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--coral)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
                >Clear all</button>
              </div>
              <div className="notif-list" role="list">
                {state.notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet 🔔</div>
                ) : (
                  state.notifications.map(n => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      role="menuitem"
                      onClick={() => {
                        dispatch({ type: 'MARK_NOTIF_READ', payload: n.id });
                        if (n.orderId) {
                          const order = state.orderHistory.find(o => o.id === n.orderId || o.order_id === n.orderId);
                          if (order) navigate('order-detail', order);
                        }
                        setShowNotifs(false);
                      }}
                    >
                      <span className="notif-icon">{n.icon || '🔔'}</span>
                      <div style={{ flex: 1 }}>
                        <div className="notif-text">{n.text}</div>
                        <div className="notif-time">{timeAgo(n.time)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart (student only) */}
        {!isAdmin && (
          <button
            className="nav-icon-btn"
            onClick={() => navigate('cart')}
            aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="nav-badge">{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </button>
        )}

        {/* Hamburger */}
        <button
          className="nav-icon-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-label="Open menu"
          aria-expanded={state.sidebarOpen}
        >
          <MenuIcon />
        </button>
      </div>
    </nav>
  );
}

/* ── Icons ────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
