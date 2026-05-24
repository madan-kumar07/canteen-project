import { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

/* ── Toast Container ────────────────────────────────────── */
export function ToastContainer() {
  const { state, dispatch } = useApp();

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {state.toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={() => dispatch({ type: 'REMOVE_TOAST', payload: t.id })} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  const duration = toast.duration || 3500;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className={`toast ${toast.type || 'info'} ${leaving ? 'leaving' : ''}`} role="alert">
      <div className="toast-progress" style={{ animationDuration: `${duration}ms` }} />
      <span className="toast-icon">{toast.icon}</span>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.msg && <div className="toast-msg">{toast.msg}</div>}
      </div>
      <button className="toast-close" onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}

/* ── Qty Control ────────────────────────────────────────── */
export function QtyCtrl({ qty, onAdd, onRemove, size = 'md' }) {
  const sm = size === 'sm';
  return (
    <div className="qty-ctrl" role="group" aria-label="Quantity">
      <button
        className="qty-btn minus"
        onClick={e => { e.stopPropagation(); onRemove(); }}
        aria-label="Decrease quantity"
        style={sm ? { width: 24, height: 24, fontSize: '0.8rem' } : {}}
      >−</button>
      <span className="qty-num" style={sm ? { minWidth: 18, fontSize: '0.8rem' } : {}}>{qty}</span>
      <button
        className="qty-btn plus"
        onClick={e => { e.stopPropagation(); onAdd(); }}
        aria-label="Increase quantity"
        style={sm ? { width: 24, height: 24, fontSize: '0.8rem' } : {}}
      >+</button>
    </div>
  );
}

/* ── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = 20, dark = false }) {
  return (
    <div
      className={`spinner ${dark ? 'dark' : ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ── Status Badge ────────────────────────────────────────── */
export function StatusBadge({ status }) {
  const map = {
    Pending:   { cls: 'pending',   dot: 'amber', label: 'Pending' },
    Confirmed: { cls: 'preparing', dot: 'blue',  label: 'Confirmed' },
    Preparing: { cls: 'preparing', dot: 'blue',  label: 'Preparing' },
    Ready:     { cls: 'ready',     dot: 'mint',  label: 'Ready!' },
    Completed: { cls: 'completed', dot: null,    label: 'Completed' },
    Cancelled: { cls: 'cancelled', dot: null,    label: 'Cancelled' },
  };
  const s = map[status] || { cls: 'pending', dot: null, label: status };
  return (
    <span className={`status-badge ${s.cls}`}>
      {s.dot && <span className={`status-dot-live ${s.dot}`} />}
      {s.label}
    </span>
  );
}

/* ── Empty State ─────────────────────────────────────────── */
export function EmptyState({ art = '🍽️', title = 'Nothing here', sub = '', action, actionLabel = 'Go Back' }) {
  return (
    <div className="empty-state">
      <div className="empty-art">{art}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
      {action && (
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ── Skeleton Food Card ──────────────────────────────────── */
export function SkeletonFoodCard() {
  return (
    <div className="skeleton-food-card">
      <div className="skeleton-food-body">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line full" />
        <div className="skeleton skeleton-line tall" style={{ width: 80, marginTop: 8 }} />
      </div>
      <div className="skeleton skeleton-food-img" />
    </div>
  );
}

/* ── Skeleton Card ───────────────────────────────────────── */
export function SkeletonCard({ height = 80 }) {
  return <div className="skeleton" style={{ width: '100%', height, borderRadius: 12 }} />;
}

/* ── Veg/NonVeg Dot ─────────────────────────────────────── */
export function VegDot({ isVeg }) {
  return (
    <div
      className={`food-card-veg-dot ${isVeg ? 'veg' : 'non-veg'}`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    />
  );
}

/* ── Format helpers ─────────────────────────────────────── */
export function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(typeof ts === 'number' && ts < 2e12 ? ts * 1000 : ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(typeof ts === 'number' && ts < 2e12 ? ts * 1000 : ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(typeof ts === 'number' && ts < 2e12 ? ts * 1000 : ts);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

export function timeAgo(ts) {
  const now = Date.now();
  const t   = typeof ts === 'number' && ts < 2e12 ? ts * 1000 : ts;
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60)  return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Rush level ─────────────────────────────────────────── */
export function getRushLevel(pendingCount) {
  if (pendingCount <= 3)  return { label: 'Low Rush',    eta: '5–10 min',  color: 'var(--mint)',  dotColor: 'var(--mint)',  borderColor: 'rgba(0,217,163,0.3)' };
  if (pendingCount <= 8)  return { label: 'Medium Rush', eta: '10–20 min', color: 'var(--amber)', dotColor: 'var(--amber)', borderColor: 'rgba(245,158,11,0.3)' };
  return                         { label: 'High Rush',   eta: '20–30 min', color: 'var(--red)',   dotColor: 'var(--red)',   borderColor: 'rgba(239,68,68,0.3)'  };
}

/* ── Category config ────────────────────────────────────── */
const catConfigs = {
  'Morning Snacks': { emoji: '🌅', bg: 'rgba(245,158,11,0.12)' },
  'Lunch':          { emoji: '🍱', bg: 'rgba(0,217,163,0.12)'  },
  'Chaat Items':    { emoji: '🥗', bg: 'rgba(255,107,53,0.12)' },
  'Snacks':         { emoji: '🍟', bg: 'rgba(139,92,246,0.12)' },
  'Fresh Juices':   { emoji: '🧃', bg: 'rgba(59,130,246,0.12)' },
  'Soup Items':     { emoji: '🍲', bg: 'rgba(245,158,11,0.12)' },
  'Night':          { emoji: '🌙', bg: 'rgba(139,92,246,0.12)' },
  'Starters':       { emoji: '🍗', bg: 'rgba(255,107,53,0.12)' },
  'Beverages':      { emoji: '☕', bg: 'rgba(59,130,246,0.12)' },
  'Desserts':       { emoji: '🍰', bg: 'rgba(236,72,153,0.12)' },
  'All':            { emoji: '✨', bg: 'rgba(255,255,255,0.06)' },
};

export function getCatConfig(cat) {
  return catConfigs[cat] || { emoji: '🍽️', bg: 'rgba(255,255,255,0.06)' };
}

/* ── Determine veg/non-veg ──────────────────────────────── */
export function isVegItem(item) {
  const name = (item.name || '').toLowerCase();
  const nonVegWords = ['chicken', 'egg', 'mutton', 'fish', 'prawn', 'beef', 'pork', 'meat', 'non-veg'];
  const vegWords    = ['veg', 'paneer', 'gobi', 'mushroom', 'aloo', 'dal', 'tofu'];
  if (nonVegWords.some(w => name.includes(w))) return false;
  if (vegWords.some(w => name.includes(w)))    return true;
  return true; // default to veg for unknown
}

/* ── Confetti burst ─────────────────────────────────────── */
export function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    vx: (Math.random() - 0.5) * 6,
    vy: Math.random() * 4 + 2,
    color: ['#ff6b35','#f59e0b','#00d9a3','#3b82f6','#8b5cf6'][Math.floor(Math.random() * 5)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 8,
  }));

  let frame = 0;
  const animate = () => {
    if (frame++ > 120) { canvas.remove(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rotation += p.rotSpeed; p.vy += 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

/* ── Greeting ───────────────────────────────────────────── */
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

/* ── Rating Stars ───────────────────────────────────────── */
export function StarRating({ value = 0, max = 5, onChange, size = 18 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <span
          key={star}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            fontSize: size,
            cursor: onChange ? 'pointer' : 'default',
            color: star <= (hover || value) ? 'var(--amber)' : 'var(--surface4)',
            transition: 'color 0.15s ease',
          }}
          aria-label={`${star} star`}
        >★</span>
      ))}
    </div>
  );
}

/* ── Input with icon ────────────────────────────────────── */
export function IconInput({ icon, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', pointerEvents: 'none' }}>
        {icon}
      </span>
      <input {...props} style={{ paddingLeft: 42, ...props.style }} className={`form-input ${props.className || ''}`} />
    </div>
  );
}

/* ── Add to cart animation trigger ─────────────────────── */
export function useCartAnimation(id) {
  const [animate, setAnimate] = useState(false);
  const trigger = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);
  };
  return [animate, trigger];
}

/* ── Lazy reveal hook ───────────────────────────────────── */
export function useLazyReveal(ref, threshold = 0.1) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}
