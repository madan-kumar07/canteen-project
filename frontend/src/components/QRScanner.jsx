import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyOrder, getOrder } from '../api';

export default function QRScanner({ onClose, onVerified }) {
  const scannerRef = useRef(null);
  const [scanning,  setScanning]  = useState(false);
  const [result,    setResult]    = useState(null); // { order, error, success }
  const [manualId,  setManualId]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [mode,      setMode]      = useState('camera'); // 'camera' | 'manual'
  const html5QrRef = useRef(null);

  useEffect(() => {
    if (mode === 'camera') startCamera();
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      setScanning(true);
      html5QrRef.current = new Html5Qrcode('qr-scanner-box');
      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          stopCamera();
          handleVerify(decodedText);
        },
        () => {} // ignore errors silently
      );
    } catch (e) {
      setScanning(false);
      setMode('manual');
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrRef.current?.isScanning) {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      }
    } catch {}
    setScanning(false);
  };

  const handleVerify = async (orderId) => {
    setLoading(true);
    setResult(null);
    try {
      // First, get the order details to show
      const orderRes = await getOrder(orderId.trim());
      const order = orderRes.data;

      if (order.error) {
        setResult({ error: 'Order not found. Check the order ID.' });
        setLoading(false);
        return;
      }

      if (order.status !== 'Ready') {
        setResult({
          order,
          error: `Order is currently "${order.status}" — it must be Ready to verify.`
        });
        setLoading(false);
        return;
      }

      // Verify and complete
      const verRes = await verifyOrder(orderId.trim());
      setResult({ order: verRes.data.order, success: true });
      onVerified?.();
    } catch (e) {
      setResult({ error: 'Order not found or server error. Try manual entry.' });
    }
    setLoading(false);
  };

  const handleManual = (e) => {
    e.preventDefault();
    if (manualId.trim()) handleVerify(manualId.trim());
  };

  const reset = () => {
    setResult(null);
    setManualId('');
    if (mode === 'camera') startCamera();
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-scanner-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="qr-modal-header" style={{marginBottom:'1.25rem'}}>
          <div>
            <div className="qr-modal-title">📱 Scan & Verify Order</div>
            <div className="qr-modal-sub">Scan student QR or enter Order ID manually</div>
          </div>
          <button className="qr-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Mode toggle */}
        <div className="qr-mode-tabs">
          <button className={`qr-mode-tab ${mode==='camera'?'active':''}`} onClick={() => { stopCamera(); setMode('camera'); setResult(null); }}>
            📷 Camera Scan
          </button>
          <button className={`qr-mode-tab ${mode==='manual'?'active':''}`} onClick={() => { stopCamera(); setMode('manual'); setResult(null); }}>
            ⌨️ Manual Entry
          </button>
        </div>

        {/* RESULT */}
        {result && (
          <div className={`qr-result ${result.success ? 'success' : 'error'}`}>
            {result.success ? (
              <>
                <div className="qr-result-icon">✅</div>
                <div className="qr-result-title">Order Verified!</div>
                <div className="qr-result-token">Token #{result.order?.token_number}</div>
                <div style={{fontSize:'0.85rem',color:'var(--text2)',marginTop:'0.5rem'}}>
                  {result.order?.items?.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                </div>
                <div style={{fontSize:'1rem',fontWeight:700,color:'var(--orange)',marginTop:'0.5rem'}}>
                  ₹{result.order?.total_price}
                </div>
                <button className="qr-scan-again-btn" onClick={reset}>Scan Next Order</button>
              </>
            ) : (
              <>
                <div className="qr-result-icon">❌</div>
                <div className="qr-result-title">Verification Failed</div>
                <div style={{fontSize:'0.85rem',color:'var(--text2)',margin:'0.5rem 0'}}>
                  {result.error}
                </div>
                {result.order && (
                  <div style={{background:'var(--surface)',borderRadius:8,padding:'0.75rem',marginTop:'0.5rem',fontSize:'0.82rem',color:'var(--text2)'}}>
                    Token #{result.order.token_number} · Status: <strong style={{color:'var(--yellow)'}}>{result.order.status}</strong>
                  </div>
                )}
                <button className="qr-scan-again-btn" onClick={reset}>Try Again</button>
              </>
            )}
          </div>
        )}

        {/* CAMERA MODE */}
        {!result && mode === 'camera' && (
          <div className="qr-camera-wrap">
            <div id="qr-scanner-box" className="qr-scanner-box" />
            {scanning && (
              <div className="qr-scanning-label">
                <span className="qr-scan-pulse" /> Scanning for QR code…
              </div>
            )}
          </div>
        )}

        {/* MANUAL MODE */}
        {!result && mode === 'manual' && (
          <form onSubmit={handleManual} className="qr-manual-form">
            <div className="qr-manual-icon">🔍</div>
            <p style={{fontSize:'0.85rem',color:'var(--text2)',marginBottom:'1rem',textAlign:'center'}}>
              Enter the Order ID from the student's QR screen
            </p>
            <input
              className="lf-input"
              placeholder="e.g. ORD144591"
              value={manualId}
              onChange={e => setManualId(e.target.value.toUpperCase())}
              autoFocus
              style={{textAlign:'center',fontSize:'1.1rem',letterSpacing:'2px',marginBottom:'0.75rem'}}
            />
            <button type="submit" className="checkout-btn" disabled={!manualId.trim() || loading}>
              {loading ? <span className="login-spinner" /> : 'Verify Order →'}
            </button>
          </form>
        )}

        {loading && !result && (
          <div style={{textAlign:'center',padding:'1rem',color:'var(--text2)'}}>
            <span className="login-spinner" style={{display:'inline-block',margin:'0 auto'}} /> Verifying…
          </div>
        )}
      </div>
    </div>
  );
}
