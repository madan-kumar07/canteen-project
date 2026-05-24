import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSocket } from '../context/SocketContext';

const STUDENT_NAV = [
  { id: 'home',    icon: '🏠', label: 'Home'         },
  { id: 'search',  icon: '🔍', label: 'Search'        },
  { id: 'cart',    icon: '🛒', label: 'Cart'          },
  { id: 'orders',  icon: '📋', label: 'My Orders'     },
  { id: 'profile', icon: '👤', label: 'Profile'       },
];

const ADMIN_NAV = [
  { id: 'admin',   icon: '📊', label: 'Dashboard'     },
  { id: 'queue',   icon: '🎯', label: 'Queue'         },
  { id: 'scan',    icon: '📷', label: 'Scan QR'       },
];

export default function Sidebar() {
  const { state, dispatch, cartCount, navigate } = useApp();
  const { connected, quality } = useSocket();
  const { sidebarOpen, user, activePage } = state;
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  // Lock body scroll when open
  useEffect(() => {
    if (sidebarOpen) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, [sidebarOpen]);

  const close = () => dispatch({ type: 'CLOSE_SIDEBAR' });

  const handleNav = (id) => {
    navigate(id);
    close();
  };

  const handleLogout = () => {
    localStorage.removeItem('sc_user');
    dispatch({ type: 'LOGOUT' });
    close();
  };

  if (!sidebarOpen) return null;

  const initial = (user?.username?.[0] || 'U').toUpperCase();

  const qualityLabel = { good: '🟢 Connected', slow: '🟡 Slow', offline: '🔴 Offline' }[quality] || '🔴 Offline';

  return (
    <>
      {/* Overlay */}
      <div
        className="sidebar-overlay"
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className="sidebar" role="dialog" aria-modal="true" aria-label="Navigation menu">

        {/* Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div className="sidebar-avatar">{initial}</div>
            <button
              onClick={close}
              style={{
                background: 'var(--surface3)', border: 'none', borderRadius: '50%',
                width: 32, height: 32, color: 'var(--text3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
              }}
              aria-label="Close menu"
            >✕</button>
          </div>
          <div className="sidebar-username" style={{ marginTop: 12 }}>{user?.username || 'Guest'}</div>
          <div className="sidebar-role">{isAdmin ? '🔑 Admin' : '🎓 Student'}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text4)', marginTop: 8 }}>{qualityLabel}</div>
        </div>

        {/* Wallet (student only) */}
        {!isAdmin && (
          <div className="sidebar-wallet">
            <div>
              <div className="sidebar-wallet-label">Wallet Balance</div>
              <div className="sidebar-wallet-amt">₹{state.wallet.toFixed(2)}</div>
            </div>
            <button
              onClick={() => { handleNav('profile'); }}
              style={{
                background: 'var(--coral)', color: 'white', border: 'none',
                borderRadius: 'var(--rfull)', padding: '6px 14px',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
              }}
            >Top Up</button>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav" role="list">
          {navItems.map(item => {
            const isActive = activePage === item.id;
            const badge = item.id === 'cart' ? cartCount : 0;
            return (
              <div
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                role="listitem"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="sidebar-nav-icon">{item.icon}</div>
                <span>{item.label}</span>
                {badge > 0 && (
                  <span className="sidebar-nav-badge">{badge}</span>
                )}
              </div>
            );
          })}

          <div className="sidebar-divider" />

          {/* Settings / Support */}
          <div
            className="sidebar-nav-item"
            onClick={close}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && close()}
          >
            <div className="sidebar-nav-icon">⚙️</div>
            <span>Settings</span>
          </div>
          <div
            className="sidebar-nav-item"
            onClick={close}
            tabIndex={0}
          >
            <div className="sidebar-nav-icon">💬</div>
            <span>Support</span>
          </div>
        </nav>

        {/* Footer: logout */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '12px', background: 'var(--red-soft)',
              border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)',
              borderRadius: 'var(--r3)', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
            onMouseEnter={e => { e.target.style.background = 'var(--red)'; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.background = 'var(--red-soft)'; e.target.style.color = 'var(--red)'; }}
          >
            🚪 Logout
          </button>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.7rem', color: 'var(--text4)' }}>
            SmartCanteen v2.0 · © 2024
          </div>
        </div>
      </aside>
    </>
  );
}
