import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ScanVerifyModal({ onClose }) {
  const { toast } = useApp();
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const verify = async (id) => {
    const oid = id || orderId.trim();
    if (!oid) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${oid}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setResult({ success: true, order: data });

      // Mark as completed
      if (data.status === 'Ready') {
        await fetch(`http://localhost:5000/api/orders/${oid}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Completed' }),
        });
        setResult(prev => ({ ...prev, completed: true }));
        toast('success', '✅ Verified!', `Order #${data.token || oid.slice(-4)} marked as completed`);
      }
    } catch {
      setResult({ success: false, error: 'Order not found or already completed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="scan-modal-overlay" onClick={onClose}>
      <div className="scan-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
          <div className="scan-modal-title">📷 Scan & Verify</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Camera view placeholder */}
        <div className="scan-frame-overlay" style={{ marginBottom: 'var(--s4)' }}>
          {!videoError ? (
            <div style={{ width: '100%', aspectRatio: 1, background: 'linear-gradient(135deg,#0b101a,#1a2335)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ fontSize: '3rem' }}>📷</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text3)', textAlign: 'center' }}>
                Camera scanning is not available in browser<br />
                Use manual entry below
              </div>
            </div>
          ) : null}
          <div className="scan-corner tl" />
          <div className="scan-corner tr" />
          <div className="scan-corner bl" />
          <div className="scan-corner br" />
        </div>

        {/* Manual input */}
        <div style={{ marginBottom: 'var(--s4)' }}>
          <div className="form-label" style={{ marginBottom: 'var(--s2)' }}>Manual Order ID / Token</div>
          <div style={{ display: 'flex', gap: 'var(--s2)' }}>
            <input
              ref={inputRef}
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Enter order ID or token..."
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verify()}
            />
            <button
              className="place-order-btn"
              style={{ flex: 0, padding: 'var(--s3) var(--s5)', borderRadius: 'var(--r2)' }}
              onClick={() => verify()}
              disabled={loading}
            >
              {loading ? '⌛' : '✓ Verify'}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            padding: 'var(--s4)', borderRadius: 'var(--r3)',
            background: result.success ? 'var(--mint-soft)' : 'var(--red-soft)',
            border: `1px solid ${result.success ? 'rgba(0,200,83,0.3)' : 'rgba(244,63,94,0.3)'}`,
            animation: 'scale-in 0.2s var(--ease-spring)'
          }}>
            {result.success ? (
              <>
                <div style={{ color: result.completed ? 'var(--mint)' : 'var(--amber)', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                  {result.completed ? '✅ Order Verified & Completed!' : `⚠️ Order Status: ${result.order?.status}`}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
                  <div>Token: <strong>#{result.order?.token || result.order?.id?.slice(-4)}</strong></div>
                  <div>Customer: <strong>{result.order?.user || 'N/A'}</strong></div>
                  <div>Items: <strong>{(result.order?.items || []).map(i => `${i.name}×${i.qty||1}`).join(', ')}</strong></div>
                  <div>Total: <strong>₹{result.order?.total || 0}</strong></div>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--red)', fontWeight: 700 }}>❌ {result.error}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
