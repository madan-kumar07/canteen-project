import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QtyCtrl, Spinner, triggerConfetti, getCatConfig, isVegItem, VegDot } from '../utils/ui';
import { placeOrder, createPayment } from '../api';

const PICKUP_SLOTS = [
  { id: 'now', label: 'ASAP',     sub: '8–15 min'  },
  { id: '30',  label: '12:30 PM', sub: 'In ~30 min' },
  { id: '45',  label: '12:45 PM', sub: 'In ~45 min' },
  { id: '60',  label: '1:00 PM',  sub: 'In ~1 hour' },
];

const PAY_METHODS = [
  { id: 'counter', icon: '🏪', label: 'Counter',  sub: 'Pay at pickup' },
  { id: 'online',  icon: '💳', label: 'UPI/Card', sub: 'Razorpay'     },
  { id: 'wallet',  icon: '💰', label: 'Wallet',   sub: 'Instant pay'  },
];

export default function CartPage() {
  const {
    state, dispatch,
    cartCount, cartSubtotal, cartTotal, gst, promoDiscount,
    toast, navigate, VALID_PROMOS
  } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [loading,    setLoading]    = useState(false);

  const { cart, promo, promoError, paymentMethod, pickupSlot, wallet } = state;
  const selSlot  = PICKUP_SLOTS.find(s => s.id === (pickupSlot || 'now')) || PICKUP_SLOTS[0];

  const addItem  = (item) => dispatch({ type: 'ADD_TO_CART',    payload: { item } });
  const remItem  = (id)   => dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  const clearAll = ()     => dispatch({ type: 'CLEAR_CART' });

  const applyPromo = () => {
    if (!promoInput.trim()) return;
    dispatch({ type: 'APPLY_PROMO', payload: promoInput });
    setPromoInput('');
  };

  /* ─── Place Order ─── */
  const handlePlaceOrder = async () => {
    if (!cart.length) return;
    if (paymentMethod === 'wallet' && wallet < cartTotal) {
      toast('error', 'Insufficient Wallet Balance', `Need ₹${cartTotal}, have ₹${wallet}`);
      return;
    }

    setLoading(true);
    const orderData = {
      items:          cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total:          cartTotal,
      subtotal:       cartSubtotal,
      gst,
      discount:       promoDiscount,
      promo:          promo?.code || null,
      payment_method: paymentMethod,
      pickup_slot:    selSlot.label,
      user:           state.user?.username,
    };

    try {
      /* Online payment (Razorpay) */
      if (paymentMethod === 'online') {
        const rzpOrder = await createPayment(cartTotal);
        if (!rzpOrder.id && !rzpOrder.razorpay_order_id) throw new Error('Payment init failed');

        await new Promise((resolve, reject) => {
          const rzp = new (window.Razorpay || (() => ({ open: resolve })))({
            key: rzpOrder.key || 'rzp_test_placeholder',
            amount: rzpOrder.amount,
            currency: 'INR',
            name: 'SmartCanteen',
            description: `Order for ${state.user?.username}`,
            order_id: rzpOrder.id || rzpOrder.razorpay_order_id,
            handler: resolve,
            modal: { ondismiss: () => reject(new Error('cancelled')) },
          });
          if (rzpOrder.test_mode) {
            // Test mode: skip Razorpay UI
            setTimeout(resolve, 500);
          } else {
            rzp.open();
          }
        });
      }

      /* Wallet deduction */
      if (paymentMethod === 'wallet') {
        dispatch({ type: 'DEDUCT_WALLET', payload: cartTotal, note: 'Order payment' });
      }

      /* Place order */
      const res = await placeOrder(orderData);
      if (!res.order) throw new Error('Order creation failed');

      const placed = {
        ...res.order,
        items:          orderData.items,
        total:          cartTotal,
        subtotal:       cartSubtotal,
        gst,
        discount:       promoDiscount,
        promo:          promo?.code,
        payment_method: paymentMethod,
        pickup_slot:    selSlot.label,
        status:         'Pending',
        placedAt:       Date.now(),
      };

      dispatch({ type: 'ADD_ORDER_HISTORY', payload: placed });
      dispatch({ type: 'CLEAR_CART' });
      triggerConfetti();
      toast('order', '🎉 Order Placed!', `Token #${placed.token || String(placed.id || '').slice(-4)} — ${selSlot.label}`);
      navigate('order-detail', placed);

    } catch (err) {
      if (err.message === 'cancelled') {
        toast('info', 'Payment cancelled', '');
      } else {
        toast('error', 'Order Failed', err.message || 'Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─── Empty Cart ─── */
  if (!cart.length) {
    return (
      <div className="cart-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="cart-empty">
          <div className="cart-empty-art">🛒</div>
          <div className="cart-empty-title">Your cart is empty</div>
          <div className="cart-empty-sub">Add some delicious items to get started!</div>
          <button className="empty-cta" onClick={() => navigate('home')}>🍽️ Browse Menu</button>
        </div>
      </div>
    );
  }

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const walletSufficient = wallet >= cartTotal;

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <div>
          <div className="cart-header-title">🛒 Your Cart</div>
          <div className="cart-header-sub">{itemCount} item{itemCount > 1 ? 's' : ''} ready to order</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={clearAll}
            style={{ background: 'var(--red-soft)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', padding: '8px 16px', borderRadius: 'var(--rfull)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >Clear All</button>
          <button className="btn btn-ghost" onClick={() => navigate('home')}>← Menu</button>
        </div>
      </div>

      <div className="cart-layout">
        {/* Left column */}
        <div>
          {/* Cart Items */}
          <div className="cart-section">
            <div className="cart-section-title">Order Items</div>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                {item.image
                  ? <img className="cart-item-img" src={item.image} alt={item.name} loading="lazy"
                      onError={e => { e.target.style.display='none'; if(e.target.nextSibling) e.target.nextSibling.style.display='flex'; }} />
                  : null}
                <div className="cart-item-img-ph" style={{ display: item.image ? 'none' : 'flex' }}>
                  {getCatConfig(item.category).emoji}
                </div>
                <div className="cart-item-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <VegDot isVeg={isVegItem(item)} />
                    <div className="cart-item-name">{item.name}</div>
                  </div>
                  <div className="cart-item-unit">₹{item.price} × {item.qty}</div>
                </div>
                <QtyCtrl qty={item.qty} onAdd={() => addItem(item)} onRemove={() => remItem(item.id)} />
                <div className="cart-item-total">₹{item.price * item.qty}</div>
              </div>
            ))}
          </div>

          {/* Promo Code */}
          <div className="cart-section">
            <div className="cart-section-title">Promo Code</div>
            {promo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="promo-applied" style={{ flex: 1 }}>
                  ✅ {promo.code} — {promo.label}
                </div>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_PROMO' })}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >Remove</button>
              </div>
            ) : (
              <>
                <div className="promo-row">
                  <input
                    className="promo-input"
                    placeholder="Enter promo code…"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    aria-label="Promo code"
                  />
                  <button className="promo-apply" onClick={applyPromo}>Apply</button>
                </div>
                {promoError && <div className="form-error" style={{ marginTop: 8 }}>{promoError}</div>}
                <div className="chip-row" style={{ marginTop: 12 }}>
                  {Object.keys(VALID_PROMOS).map(code => (
                    <button
                      key={code}
                      className="chip"
                      onClick={() => setPromoInput(code)}
                      aria-label={`Apply promo code ${code}`}
                    >🏷️ {code}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pickup Slot */}
          <div className="cart-section">
            <div className="cart-section-title">Pickup Time</div>
            <div className="pickup-grid">
              {PICKUP_SLOTS.map(slot => (
                <div
                  key={slot.id}
                  className={`pickup-slot ${(pickupSlot || 'now') === slot.id ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_PICKUP', payload: slot.id })}
                  role="radio"
                  aria-checked={(pickupSlot || 'now') === slot.id}
                  tabIndex={0}
                >
                  <div className="pickup-slot-label">{slot.label}</div>
                  <div className="pickup-slot-sub">{slot.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bill Card */}
        <div>
          <div className="bill-card">
            <div className="bill-title">💳 Bill Summary</div>

            <div className="bill-rows">
              <div className="bill-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="bill-row">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="bill-row discount">
                  <span>Promo ({promo?.code})</span>
                  <span>−₹{promoDiscount}</span>
                </div>
              )}
              <div className="bill-row">
                <span>Platform fee</span>
                <span style={{ color: 'var(--mint)', fontWeight: 700 }}>FREE</span>
              </div>
            </div>

            <div className="bill-divider" />
            <div className="bill-row total">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>

            {promoDiscount > 0 && (
              <div className="bill-savings">🎉 You save ₹{promoDiscount} with {promo?.code}!</div>
            )}

            {/* Payment method */}
            <div style={{ marginTop: 24, marginBottom: 12, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Payment Method
            </div>
            <div className="pay-methods" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PAY_METHODS.map(pm => {
                const isWallet = pm.id === 'wallet';
                return (
                  <div
                    key={pm.id}
                    className={`pay-option ${paymentMethod === pm.id ? 'active' : ''} ${isWallet && !walletSufficient ? 'opacity-40' : ''}`}
                    onClick={() => dispatch({ type: 'SET_PAYMENT', payload: pm.id })}
                    role="radio"
                    aria-checked={paymentMethod === pm.id}
                    tabIndex={0}
                    style={{ opacity: isWallet && !walletSufficient ? 0.5 : 1, cursor: isWallet && !walletSufficient ? 'not-allowed' : 'pointer' }}
                    title={isWallet && !walletSufficient ? `Insufficient wallet balance (₹${wallet})` : ''}
                  >
                    <span className="pay-option-icon">{pm.icon}</span>
                    <div>
                      <div className="pay-option-title">{pm.label}</div>
                      <div className="pay-option-sub">
                        {isWallet ? `₹${wallet.toFixed(0)} bal` : pm.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pay-secure">🔒 100% secure · SSL encrypted checkout</div>

            {/* Place order */}
            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
              aria-busy={loading}
            >
              {loading
                ? <><Spinner size={18} /> Processing…</>
                : <>🚀 Place Order · ₹{cartTotal}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
