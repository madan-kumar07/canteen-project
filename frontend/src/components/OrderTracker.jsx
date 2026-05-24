import React, { useEffect, useRef, useState } from 'react';
import { getOrder } from '../api';

const STEPS = ['Pending','Preparing','Ready','Completed'];
const STEP_INFO = {
  Pending:   { icon:'🕐', color:'#f9a825', label:'Order Received',     sub:'Waiting in queue' },
  Preparing: { icon:'👨‍🍳', color:'#60a5fa', label:'Being Prepared',    sub:'Chef is cooking your food' },
  Ready:     { icon:'🔔', color:'#48c479', label:'Ready for Pickup!',  sub:'Go to counter NOW with your token!' },
  Completed: { icon:'✅', color:'#48c479', label:'Picked Up',          sub:'Enjoy your meal!' },
};

export default function OrderTracker({ order: initial, onDismiss }) {
  const [order,    setOrder]    = useState(initial);
  const [prevStat, setPrevStat] = useState(initial?.status);
  const [showNotif,setShowNotif]= useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!initial?.order_id) return;
    const poll = async () => {
      try {
        const res = await getOrder(initial.order_id);
        if (res.data && !res.data.error) {
          if (res.data.status === 'Ready' && prevStat !== 'Ready') {
            setShowNotif(true);
            // Try to play notification sound
            try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+LkZibn52dl5eLgXRpYmJrf4yXn6OinpmTi4R+').play(); } catch {}
          }
          setPrevStat(res.data.status);
          setOrder(res.data);
          if (res.data.status === 'Completed') clearInterval(timerRef.current);
        }
      } catch {}
    };
    timerRef.current = setInterval(poll, 3000);
    poll(); // initial poll
    return () => clearInterval(timerRef.current);
  }, [initial?.order_id]);

  if (!order) return null;

  const step = STEPS.indexOf(order.status);
  const info = STEP_INFO[order.status] || STEP_INFO.Pending;

  return (
    <>
      {/* ── READY NOTIFICATION ── */}
      {showNotif && order.status === 'Ready' && (
        <div className="notif-banner">
          <div className="notif-icon">🔔</div>
          <div className="notif-text">
            <strong>Your order is READY!</strong>
            <span>Token #{order.token_number} — Go to the counter now!</span>
          </div>
          <button className="notif-dismiss" onClick={() => setShowNotif(false)}>✕</button>
        </div>
      )}

      {/* ── TRACKER CARD ── */}
      <div className="ot-card animate-fade-in">
        {/* Orange header with token */}
        <div className="ot-header">
          <div>
            <div className="ot-title">Order Placed ✓</div>
            <div className="ot-sub">{order.order_id} · Pickup: {order.pickup_time}</div>
          </div>
          <div className="ot-token">
            <div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.7)',letterSpacing:2,textTransform:'uppercase'}}>Token</div>
            <div style={{fontSize:'2.8rem',fontWeight:900,lineHeight:1}}>#{order.token_number}</div>
          </div>
        </div>

        {/* Current status banner */}
        <div className="ot-status-block" style={{borderColor: info.color}}>
          <div className="ot-status-icon" style={{fontSize: order.status === 'Ready' ? '2.5rem' : '2rem'}}>{info.icon}</div>
          <div>
            <div className="ot-status-label" style={{color: info.color, fontSize: order.status === 'Ready' ? '1.25rem' : '1.1rem'}}>
              {info.label}
            </div>
            <div className="ot-status-sub">{info.sub}</div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="ot-steps">
          {STEPS.map((s, i) => {
            const done   = i < step;
            const active = i === step;
            const si     = STEP_INFO[s];
            return (
              <div key={s} className={`ot-step ${done?'done':''} ${active?'active':''}`}>
                <div className="ot-step-dot"
                  style={active ? {background: si.color, boxShadow:`0 0 0 4px ${si.color}33`} : done ? {background:'var(--green)'} : {}}
                >
                  {done ? '✓' : si.icon}
                </div>
                {i < STEPS.length - 1 && <div className={`ot-step-line ${done?'done':''}`} />}
                <div className="ot-step-label">{s}</div>
              </div>
            );
          })}
        </div>

        {/* QR Code — student shows this to admin */}
        <div className="ot-qr-section">
          <div className="ot-qr-label">Show this to the counter</div>
          <div className="ot-qr-box">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.order_id}`} alt="QR" />
          </div>
          <div className="ot-qr-id">{order.order_id}</div>
        </div>

        {/* Items */}
        <div className="ot-items">
          {order.items?.map((it, i) => (
            <div key={i} className="ot-item-row">
              <span className="ot-item-qty">{it.quantity}×</span>
              <span className="ot-item-name">{it.name}</span>
              <span className="ot-item-price">₹{it.price * it.quantity}</span>
            </div>
          ))}
          <div className="ot-total-row">
            <span>Total Paid</span>
            <span style={{color:'var(--orange)',fontWeight:700}}>₹{order.total_price}</span>
          </div>
        </div>

        <button className="ot-dismiss" onClick={onDismiss}>
          {order.status === 'Completed' ? '🍽️ Order More Food' : 'Back to Menu →'}
        </button>
      </div>
    </>
  );
}
