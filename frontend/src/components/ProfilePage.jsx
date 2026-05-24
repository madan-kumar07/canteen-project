import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StarRating } from '../utils/ui';

export default function ProfilePage() {
  const { state, dispatch, toast, navigate } = useApp();
  const [topUpAmt, setTopUpAmt] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);

  const { user, wallet, orderHistory, favorites } = state;
  if (!user) { navigate('home'); return null; }

  const totalOrders  = orderHistory.length;
  const totalSpent   = orderHistory.reduce((s, o) => s + (o.total || 0), 0);
  const totalSavings = orderHistory.reduce((s, o) => s + (o.discount || 0), 0);
  const initial      = (user.username?.[0] || 'U').toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('sc_user');
    dispatch({ type: 'LOGOUT' });
  };

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmt);
    if (!amount || amount <= 0 || amount > 5000) {
      toast('error', 'Invalid Amount', 'Enter an amount between ₹1 and ₹5000');
      return;
    }
    dispatch({ type: 'ADD_WALLET', payload: amount, note: 'Manual top-up' });
    toast('success', `₹${amount} Added!`, `Wallet balance: ₹${(wallet + amount).toFixed(2)}`);
    setTopUpAmt('');
    setShowTopUp(false);
  };

  const TOP_UP_AMOUNTS = [50, 100, 200, 500];

  return (
    <div className="profile-page">

      {/* Profile Hero */}
      <div className="profile-hero animate-slide-up">
        <div className="profile-avatar">{initial}</div>
        <div>
          <div className="profile-name">{user.username}</div>
          <div className="profile-role">{user.role === 'admin' ? '🔑 Admin' : '🎓 Student'}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 8 }}>
            SmartCanteen Member
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats animate-slide-up stagger-1">
        <div className="profile-stat">
          <div className="profile-stat-value">{totalOrders}</div>
          <div className="profile-stat-label">Orders</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-value">₹{totalSpent}</div>
          <div className="profile-stat-label">Total Spent</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-value">₹{totalSavings}</div>
          <div className="profile-stat-label">Saved</div>
        </div>
      </div>

      {/* Wallet */}
      <div className="wallet-card animate-slide-up stagger-2">
        <div className="wallet-balance-label">Wallet Balance</div>
        <div className="wallet-balance">₹{wallet.toFixed(2)}</div>
        <div className="wallet-actions">
          <button className="wallet-action-btn" onClick={() => setShowTopUp(v => !v)}>
            + Add Money
          </button>
          <button className="wallet-action-btn" onClick={() => navigate('orders')}>
            📋 History
          </button>
        </div>

        {showTopUp && (
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {TOP_UP_AMOUNTS.map(a => (
                <button
                  key={a}
                  onClick={() => setTopUpAmt(String(a))}
                  style={{
                    padding: '6px 14px', background: topUpAmt === String(a) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--rfull)',
                    color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >₹{a}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                placeholder="Custom amount"
                value={topUpAmt}
                onChange={e => setTopUpAmt(e.target.value)}
                style={{
                  flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                  color: 'white', fontSize: '0.9rem', outline: 'none'
                }}
                min="1" max="5000"
                aria-label="Top-up amount"
              />
              <button
                onClick={handleTopUp}
                style={{
                  padding: '10px 20px', background: 'white', color: 'var(--coral)',
                  border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem'
                }}
              >Add</button>
            </div>
          </div>
        )}
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="profile-section animate-slide-up stagger-3">
          <div className="profile-section-header">❤️ Favourites ({favorites.length})</div>
          <div style={{ padding: 'var(--s4) var(--s5)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {favorites.map(id => (
              <span
                key={id}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--rfull)', padding: '4px 12px', fontSize: '0.78rem',
                  color: 'var(--coral)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                ❤️ Item #{id}
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: id })}
                  style={{ background: 'none', border: 'none', color: 'var(--text4)', cursor: 'pointer', fontSize: '0.8rem' }}
                  aria-label={`Remove item ${id} from favorites`}
                >✕</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="profile-section animate-slide-up stagger-4">
        <div className="profile-section-header">Quick Links</div>
        {[
          { icon: '📋', label: 'Order History',      action: () => navigate('orders') },
          { icon: '🔍', label: 'Search Food',         action: () => navigate('search') },
          { icon: '🏠', label: 'Browse Menu',         action: () => navigate('home')   },
        ].map(item => (
          <div
            key={item.label}
            className="profile-menu-item"
            onClick={item.action}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && item.action()}
          >
            <div className="profile-menu-icon">{item.icon}</div>
            <span className="profile-menu-label">{item.label}</span>
            <span className="profile-menu-arrow">›</span>
          </div>
        ))}
      </div>

      {/* Account */}
      <div className="profile-section animate-slide-up stagger-5">
        <div className="profile-section-header">Account</div>
        <div className="profile-menu-item">
          <div className="profile-menu-icon">👤</div>
          <span className="profile-menu-label">Username</span>
          <span className="profile-menu-value">{user.username}</span>
        </div>
        <div className="profile-menu-item">
          <div className="profile-menu-icon">🎭</div>
          <span className="profile-menu-label">Role</span>
          <span className="profile-menu-value">{user.role}</span>
        </div>
        <div className="profile-menu-item">
          <div className="profile-menu-icon">💳</div>
          <span className="profile-menu-label">Wallet</span>
          <span className="profile-menu-value" style={{ color: 'var(--coral)', fontWeight: 700 }}>₹{wallet.toFixed(2)}</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%', padding: 16, background: 'var(--red-soft)',
          border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)',
          borderRadius: 'var(--r3)', fontWeight: 700, fontSize: '0.95rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'all 0.2s', marginTop: 8
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--red-soft)'; e.currentTarget.style.color = 'var(--red)'; }}
      >
        🚪 Sign Out
      </button>

      <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.72rem', color: 'var(--text4)' }}>
        SmartCanteen v2.0 · Built with ❤️ for your campus
      </div>
    </div>
  );
}
