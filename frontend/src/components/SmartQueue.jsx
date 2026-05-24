import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function SmartQueue() {
  const { state, dispatch } = useApp();
  const [queue, setQueue] = useState([]);
  const [currentToken, setCurrentToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const orders = await res.json();
      const readyOrders = orders.filter(o => o.status === 'Ready');
      setQueue(readyOrders);
      setCurrentToken(readyOrders[0]?.token || readyOrders[0]?.id?.slice(-3) || null);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time
  useEffect(() => {
    const handler = (e) => {
      const { orderId, status } = e.detail || {};
      if (status === 'Ready') fetchQueue();
      if (status === 'Completed') fetchQueue();
    };
    window.addEventListener('order_status_changed', handler);
    return () => window.removeEventListener('order_status_changed', handler);
  }, []);

  return (
    <div className="queue-page animate-scale-in">
      <div className="queue-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s6)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.2rem' }}>🎫 Queue Display</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 2 }}>Live pickup board</div>
          </div>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'admin' })}
          >✕</button>
        </div>

        {/* Now serving */}
        <div className="queue-now-label">Now Serving</div>
        <div className="queue-token-display">
          {loading ? '...' : currentToken ? `#${currentToken}` : '---'}
        </div>
        <div className="queue-sub">
          {queue.length === 0 ? 'No orders ready for pickup' : 'Please collect your order!'}
        </div>

        {/* Up next */}
        {queue.length > 1 && (
          <div style={{ marginTop: 'var(--s4)', padding: 'var(--s4)', background: 'var(--surface2)', borderRadius: 'var(--r3)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text3)', marginBottom: 'var(--s2)' }}>UP NEXT</div>
            <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap' }}>
              {queue.slice(1, 5).map(o => (
                <div key={o.id} style={{
                  background: 'var(--surface3)', borderRadius: 'var(--r2)', padding: '6px 14px',
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text2)'
                }}>
                  #{o.token || o.id?.slice(-3)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="queue-stats">
          <div className="queue-stat-box">
            <div className="queue-stat-num" style={{ color: 'var(--coral)' }}>{queue.length}</div>
            <div className="queue-stat-label">Ready Orders</div>
          </div>
          <div className="queue-stat-box">
            <div className="queue-stat-num" style={{ color: 'var(--mint)' }}>8–12</div>
            <div className="queue-stat-label">Avg Wait (min)</div>
          </div>
        </div>

        <button
          style={{ marginTop: 'var(--s5)', width: '100%', padding: 'var(--s3)', background: 'none', border: '1.5px solid var(--border2)', borderRadius: 'var(--r2)', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600 }}
          onClick={fetchQueue}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}
