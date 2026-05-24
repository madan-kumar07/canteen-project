import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

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
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

export function timeAgo(ts) {
  const now = Date.now();
  const t = typeof ts === 'number' && ts < 2e12 ? ts * 1000 : ts;
  const diff = Math.floor((now - t) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function isVeg(item) {
  const name = (item.name || '').toLowerCase();
  const nonVegKw = ['chicken', 'egg', 'mutton', 'fish', 'prawn', 'beef', 'pork', 'meat', 'boneless', 'lolipop', 'wings'];
  return !nonVegKw.some(w => name.includes(w));
}

export function getStatusColor(status) {
  switch (status) {
    case 'Pending':   return { bg: 'bg-amber-500/15',   text: 'text-amber-600 dark:text-amber-400',   dot: 'bg-amber-500'   };
    case 'Confirmed': return { bg: 'bg-blue-500/15',    text: 'text-blue-600 dark:text-blue-400',     dot: 'bg-blue-500'    };
    case 'Preparing': return { bg: 'bg-blue-500/15',    text: 'text-blue-600 dark:text-blue-400',     dot: 'bg-blue-500'    };
    case 'Ready':     return { bg: 'bg-green-500/15',   text: 'text-green-600 dark:text-green-400',   dot: 'bg-green-500'   };
    case 'Completed': return { bg: 'bg-surface-100 dark:bg-surface-800', text: 'text-surface-500', dot: 'bg-surface-400' };
    case 'Cancelled': return { bg: 'bg-red-500/15',     text: 'text-red-600 dark:text-red-400',       dot: 'bg-red-500'     };
    default:          return { bg: 'bg-surface-100',    text: 'text-surface-500',                     dot: 'bg-surface-400' };
  }
}

export function getProgressPercent(status) {
  return { Pending: 20, Confirmed: 40, Preparing: 65, Ready: 90, Completed: 100, Cancelled: 0 }[status] || 0;
}

export function getRushInfo(pendingCount) {
  if (pendingCount <= 3)  return { label: 'Low Rush',    color: 'text-green-500',  bar: 'bg-green-500',  percent: 25, eta: '5–10 min'  };
  if (pendingCount <= 8)  return { label: 'Medium Rush', color: 'text-amber-500',  bar: 'bg-amber-500',  percent: 60, eta: '10–20 min' };
  return                         { label: 'High Rush',   color: 'text-red-500',    bar: 'bg-red-500',    percent: 90, eta: '20–35 min' };
}

export function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 100 }, () => ({
    x:   Math.random() * canvas.width,
    y:   -20,
    vx:  (Math.random() - 0.5) * 8,
    vy:  Math.random() * 5 + 2,
    color: ['#ff6019','#f59e0b','#22c55e','#3b82f6','#8b5cf6'][Math.floor(Math.random() * 5)],
    size: Math.random() * 8 + 4,
    rot:  Math.random() * 360,
    rotV: (Math.random() - 0.5) * 10,
  }));

  let frame = 0;
  (function animate() {
    if (frame++ > 150) { canvas.remove(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vy += 0.12;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.55);
      ctx.restore();
    });
    requestAnimationFrame(animate);
  })();
}
