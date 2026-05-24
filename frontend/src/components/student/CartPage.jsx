import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Tag, Clock, CreditCard, ChevronRight, Gift, MessageSquare, AlertCircle, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiPlaceOrder, apiRecommend, apiCreatePayment } from '../../api';
import { VegBadge } from '../ui/Badge';
import { QtyControl } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { cn, formatCurrency, isVeg, triggerConfetti } from '../../lib/utils';
import { getFoodImage, PROMO_CODES, PICKUP_SLOTS } from '../../lib/constants';

const PAYMENT_OPTIONS = [
  { id: 'counter', label: 'Pay at Counter', sub: 'Cash on pickup',       icon: '🏪' },
  { id: 'online',  label: 'UPI / Card',     sub: 'Via Razorpay',         icon: '💳' },
  { id: 'wallet',  label: 'Wallet',         sub: '',                     icon: '👛' },
];

export default function CartPage() {
  const { state, dispatch, cartCount, cartSubtotal, cartTotal, promoDiscount, navigate, toast } = useApp();
  const { cart, promo, promoError, wallet, paymentMethod, pickupSlot, orderNote } = state;

  const [promoInput, setPromoInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

  useEffect(() => {
    if (cart.length > 0) {
      apiRecommend(cart).then(items => setSuggestions(items?.slice(0, 2) || [])).catch(() => {});
    }
  }, [cart.length]);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    dispatch({ type: 'APPLY_PROMO', payload: promoInput.trim() });
    setPromoInput('');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'wallet' && wallet < cartTotal) {
      toast('error', 'Insufficient Balance', `Add ${formatCurrency(cartTotal - wallet)} to your wallet`);
      return;
    }

    setPlacing(true);
    try {
      let payMethod = paymentMethod;

      // Razorpay flow (online)
      if (paymentMethod === 'online') {
        try {
          const orderResp = await apiCreatePayment(cartTotal);
          await new Promise((resolve, reject) => {
            const rzp = new window.Razorpay({
              key: orderResp.key || 'rzp_test_YourKeyHere',
              amount: orderResp.amount,
              currency: 'INR',
              name: 'SmartCanteen',
              description: `Token for your order`,
              order_id: orderResp.razorpay_order_id,
              handler: resolve,
              modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
              theme: { color: '#ff6019' },
            });
            rzp.open();
          });
          payMethod = 'UPI/Card';
        } catch (err) {
          if (err.message === 'Payment cancelled') { setPlacing(false); return; }
          payMethod = 'counter'; // fallback
        }
      }

      const orderData = {
        items:          cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        total:          cartTotal,
        subtotal:       cartSubtotal,
        discount:       promoDiscount,
        promo:          promo?.code || null,
        payment_method: payMethod,
        pickup_slot:    pickupSlot,
        note:           orderNote,
        user:           state.user?.username || 'student',
      };

      const res = await apiPlaceOrder(orderData);
      const order = res.order || res;

      // Wallet deduct
      if (paymentMethod === 'wallet') dispatch({ type: 'DEDUCT_WALLET', payload: cartTotal });

      // Loyalty points (1 point per ₹5)
      dispatch({ type: 'ADD_POINTS', payload: Math.floor(cartTotal / 5) });
      dispatch({ type: 'ADD_ORDER',  payload: { ...order, items: orderData.items } });
      dispatch({ type: 'ADD_NOTIF', payload: { title: 'Order Placed!', msg: `Token #${order.token || order.token_number}` } });
      dispatch({ type: 'CLEAR_CART' });

      triggerConfetti();
      setSuccessModal(order);
    } catch (err) {
      toast('error', 'Order Failed', err.message || 'Please try again');
    } finally {
      setPlacing(false);
    }
  };

  const handleAddSuggestion = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
    setSuggestions(prev => prev.filter(s => s.id !== item.id));
  };

  if (cart.length === 0 && !successModal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10 text-surface-400" />
        </div>
        <h2 className="text-h2 mb-2">Your cart is empty</h2>
        <p className="text-surface-400 text-sm mb-8 max-w-xs">Add delicious items from the menu and they'll appear here.</p>
        <Button variant="primary" size="lg" onClick={() => navigate('home')}>Browse Menu</Button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-lg mx-auto pb-24 px-4 pt-4">
        <h1 className="text-h2 mb-5">Your Order</h1>

        {/* Cart Items */}
        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {cart.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="flex items-center gap-3 p-4 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl"
              >
                <img
                  src={getFoodImage(item.name, item.image)}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <VegBadge isVeg={isVeg(item)} />
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{item.name}</p>
                  </div>
                  <p className="text-sm font-bold text-surface-900 dark:text-surface-50">₹{item.price * item.qty}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => dispatch({ type: 'SET_CART_QTY', payload: { id: item.id, qty: 0 } })}
                    className="text-surface-300 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <QtyControl
                    qty={item.qty}
                    onAdd={() => dispatch({ type: 'ADD_TO_CART', payload: item })}
                    onRemove={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                    size="sm"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
              <Gift className="w-3.5 h-3.5 text-brand-500" /> You might also like
            </p>
            <div className="flex gap-3">
              {suggestions.map(item => (
                <div key={item.id} className="flex-1 p-3 rounded-2xl border border-brand-500/30 bg-brand-500/5 flex items-center gap-3">
                  <img
                    src={getFoodImage(item.name, item.image)}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 truncate">{item.name}</p>
                    <p className="text-xs text-brand-500 font-bold">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => handleAddSuggestion(item)}
                    className="text-xs font-bold text-brand-500 border border-brand-500 px-2.5 py-1 rounded-lg hover:bg-brand-500 hover:text-white transition-colors flex-shrink-0"
                  >+ Add</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Note */}
        <div className="mb-6">
          <Textarea
            label="Special Instructions (optional)"
            placeholder="E.g. Less spicy, extra sauce, no onions..."
            value={orderNote}
            onChange={e => dispatch({ type: 'SET_NOTE', payload: e.target.value })}
          />
        </div>

        {/* Promo Code */}
        <div className="mb-6 p-4 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl">
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-3">
            <Tag className="w-3.5 h-3.5 text-brand-500" /> Promo Code
          </p>
          {promo ? (
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/30">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Tag className="w-3.5 h-3.5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{promo.code}</p>
                  <p className="text-xs text-surface-400">Saving {formatCurrency(promoDiscount)}</p>
                </div>
              </div>
              <button onClick={() => dispatch({ type: 'REMOVE_PROMO' })} className="text-xs text-red-400 font-semibold">Remove</button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="Enter code (e.g. FIRST50)"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm font-mono text-surface-900 dark:text-surface-50 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
                >Apply</button>
              </div>
              {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.keys(PROMO_CODES).map(code => (
                  <button
                    key={code}
                    onClick={() => dispatch({ type: 'APPLY_PROMO', payload: code })}
                    className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-mono text-brand-500 hover:bg-brand-500/10 transition-colors"
                  >{code}</button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pickup Slot */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-brand-500" /> Pickup Time
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PICKUP_SLOTS.map(slot => (
              <button
                key={slot.id}
                onClick={() => dispatch({ type: 'SET_PICKUP', payload: slot.id })}
                className={cn('p-3 rounded-xl text-left border transition-all',
                  pickupSlot === slot.id
                    ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300'
                )}
              >
                <p className="text-sm font-semibold">{slot.label}</p>
                <p className="text-xs text-surface-400 mt-0.5">{slot.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-3">
            <CreditCard className="w-3.5 h-3.5 text-brand-500" /> Payment Method
          </p>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => dispatch({ type: 'SET_PAYMENT', payload: opt.id })}
                className={cn('w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                  paymentMethod === opt.id
                    ? 'bg-brand-500/10 border-brand-500'
                    : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 hover:border-surface-300'
                )}
              >
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className={cn('text-sm font-semibold', paymentMethod === opt.id ? 'text-brand-600 dark:text-brand-400' : 'text-surface-900 dark:text-surface-100')}>{opt.label}</p>
                  <p className="text-xs text-surface-400">{opt.id === 'wallet' ? `Balance: ${formatCurrency(wallet)}` : opt.sub}</p>
                </div>
                <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  paymentMethod === opt.id ? 'border-brand-500' : 'border-surface-300 dark:border-surface-600'
                )}>
                  {paymentMethod === opt.id && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                </div>
              </button>
            ))}
          </div>
          {paymentMethod === 'wallet' && wallet < cartTotal && (
            <div className="mt-2 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Insufficient wallet balance. Need {formatCurrency(cartTotal - wallet)} more.
                <button onClick={() => navigate('profile')} className="ml-1 underline font-semibold">Top up</button>
              </p>
            </div>
          )}
        </div>

        {/* Bill Summary */}
        <div className="mb-6 p-5 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl">
          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-4">Order Summary</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm text-surface-600 dark:text-surface-400">
              <span>Subtotal ({cartCount} items)</span>
              <span>{formatCurrency(cartSubtotal)}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Promo ({promo?.code})</span>
                <span>−{formatCurrency(promoDiscount)}</span>
              </div>
            )}
            <div className="border-t border-surface-100 dark:border-surface-800 pt-2.5 mt-2.5 flex justify-between">
              <span className="font-bold text-surface-900 dark:text-surface-50">Total</span>
              <span className="font-bold text-xl text-surface-900 dark:text-surface-50">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>

        {/* Place Order */}
        <Button
          variant="primary"
          size="xl"
          className="w-full"
          loading={placing}
          disabled={cart.length === 0}
          onClick={handlePlaceOrder}
          iconRight={!placing && <ChevronRight className="w-5 h-5" />}
        >
          {placing ? 'Placing Order...' : `Place Order · ${formatCurrency(cartTotal)}`}
        </Button>
      </div>

      {/* ── Success Modal ── */}
      <Modal open={!!successModal} onClose={() => { setSuccessModal(null); navigate('orders'); }} size="sm">
        {successModal && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-h2 mb-1">Order Placed!</h2>
            <p className="text-surface-400 text-sm mb-5">Your food is being prepared</p>

            <div className="p-4 bg-brand-500/10 rounded-2xl border border-brand-500/20 mb-5">
              <p className="text-xs text-brand-500 font-semibold mb-1">Your Token Number</p>
              <p className="text-5xl font-display font-black text-brand-500">
                #{successModal.token || successModal.token_number}
              </p>
              <p className="text-xs text-surface-400 mt-1">Show this when collecting your order</p>
            </div>

            <div className="text-sm text-surface-600 dark:text-surface-400 space-y-1 mb-6">
              <p>Order ID: <span className="font-mono font-semibold">{successModal.id || successModal.order_id}</span></p>
              <p>Payment: <span className="capitalize font-medium">{successModal.payment_method}</span></p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setSuccessModal(null); navigate('home'); }}>
                Back to Menu
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => { setSuccessModal(null); navigate('orders'); }}>
                Track Order
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
