import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { PROMO_CODES } from '../lib/constants';

const AppContext = createContext(null);

/* ── Persisted keys ── */
function loadLocal() {
  try {
    return {
      cart:           JSON.parse(localStorage.getItem('sc_cart')    || '[]'),
      favorites:      JSON.parse(localStorage.getItem('sc_favs')    || '[]'),
      wishlist:       JSON.parse(localStorage.getItem('sc_wish')    || '[]'),
      orderHistory:   JSON.parse(localStorage.getItem('sc_hist')    || '[]'),
      recentSearches: JSON.parse(localStorage.getItem('sc_srch')    || '[]'),
      wallet:         Number(localStorage.getItem('sc_wallet')      || 0),
      loyaltyPoints:  Number(localStorage.getItem('sc_pts')         || 0),
      ratings:        JSON.parse(localStorage.getItem('sc_ratings') || '{}'),
      notifications:  JSON.parse(localStorage.getItem('sc_notifs')  || '[]'),
    };
  } catch { return {}; }
}

function calcPromo(promo, subtotal) {
  if (!promo) return 0;
  const cfg = PROMO_CODES[promo.code];
  if (!cfg) return 0;
  if (cfg.minOrder && subtotal < cfg.minOrder) return 0;
  if (cfg.type === 'flat') return Math.min(cfg.discount, cfg.maxDiscount);
  return Math.min(Math.round(subtotal * cfg.discount / 100), cfg.maxDiscount);
}

const initialState = {
  user:           null,
  activePage:     'home',
  selectedOrder:  null,
  sidebarOpen:    false,
  cart:           [],
  favorites:      [],
  wishlist:       [],
  orderHistory:   [],
  recentSearches: [],
  notifications:  [],
  toasts:         [],
  promo:          null,
  promoError:     null,
  paymentMethod:  'counter',
  pickupSlot:     'asap',
  orderNote:      '',
  wallet:         0,
  loyaltyPoints:  0,
  ratings:        {},
  cartOpen:       false,
};

function reducer(state, action) {
  switch (action.type) {

    /* ── Init ── */
    case 'INIT':     return { ...state, ...action.payload };
    case 'SET_USER': return { ...state, user: action.payload };
    case 'LOGOUT':   return { ...initialState, ...loadLocal() };

    /* ── Navigation ── */
    case 'SET_PAGE':         return { ...state, activePage: action.payload, sidebarOpen: false };
    case 'TOGGLE_SIDEBAR':   return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'CLOSE_SIDEBAR':    return { ...state, sidebarOpen: false };
    case 'SET_SELECTED_ORDER': return { ...state, selectedOrder: action.payload };
    case 'TOGGLE_CART':      return { ...state, cartOpen: !state.cartOpen };
    case 'SET_CART_OPEN':    return { ...state, cartOpen: action.payload };

    /* ── Cart ── */
    case 'ADD_TO_CART': {
      const item = action.payload;
      const idx  = state.cart.findIndex(c => String(c.id) === String(item.id));
      const cart = idx >= 0
        ? state.cart.map((c, i) => i === idx ? { ...c, qty: c.qty + 1 } : c)
        : [...state.cart, { ...item, qty: 1 }];
      return { ...state, cart };
    }
    case 'REMOVE_FROM_CART': {
      const id   = String(action.payload);
      const item = state.cart.find(c => String(c.id) === id);
      if (!item) return state;
      const cart = item.qty === 1
        ? state.cart.filter(c => String(c.id) !== id)
        : state.cart.map(c  => String(c.id) === id ? { ...c, qty: c.qty - 1 } : c);
      return { ...state, cart };
    }
    case 'SET_CART_QTY': {
      const { id, qty } = action.payload;
      if (qty <= 0) return { ...state, cart: state.cart.filter(c => String(c.id) !== String(id)) };
      return { ...state, cart: state.cart.map(c => String(c.id) === String(id) ? { ...c, qty } : c) };
    }
    case 'CLEAR_CART': return { ...state, cart: [], promo: null, promoError: null, orderNote: '' };
    case 'SET_NOTE':   return { ...state, orderNote: action.payload };

    /* ── Promo ── */
    case 'APPLY_PROMO': {
      const code = String(action.payload).toUpperCase().trim();
      const cfg  = PROMO_CODES[code];
      if (!cfg) return { ...state, promoError: 'Invalid promo code', promo: null };
      return { ...state, promo: { code, ...cfg }, promoError: null };
    }
    case 'REMOVE_PROMO': return { ...state, promo: null, promoError: null };

    /* ── Payment / Pickup ── */
    case 'SET_PAYMENT': return { ...state, paymentMethod: action.payload };
    case 'SET_PICKUP':  return { ...state, pickupSlot: action.payload };

    /* ── Favorites / Wishlist ── */
    case 'TOGGLE_FAV': {
      const id  = String(action.payload);
      const favorites = state.favorites.includes(id)
        ? state.favorites.filter(f => f !== id)
        : [...state.favorites, id];
      return { ...state, favorites };
    }
    case 'TOGGLE_WISH': {
      const id = String(action.payload);
      const wishlist = state.wishlist.includes(id)
        ? state.wishlist.filter(w => w !== id)
        : [...state.wishlist, id];
      return { ...state, wishlist };
    }

    /* ── Search ── */
    case 'ADD_SEARCH': {
      const recentSearches = [action.payload, ...state.recentSearches.filter(s => s !== action.payload)].slice(0, 10);
      return { ...state, recentSearches };
    }
    case 'CLEAR_SEARCHES':  return { ...state, recentSearches: [] };
    case 'REMOVE_SEARCH':   return { ...state, recentSearches: state.recentSearches.filter(s => s !== action.payload) };

    /* ── Toasts ── */
    case 'ADD_TOAST': {
      const toast = { id: Date.now() + Math.random(), ...action.payload };
      return { ...state, toasts: [toast, ...state.toasts].slice(0, 5) };
    }
    case 'REMOVE_TOAST': return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    /* ── Orders ── */
    case 'ADD_ORDER': {
      const orderHistory = [action.payload, ...state.orderHistory].slice(0, 100);
      return { ...state, orderHistory };
    }
    case 'UPDATE_ORDER': {
      const { orderId, updates } = action.payload;
      const orderHistory = state.orderHistory.map(o =>
        (o.id === orderId || o.order_id === orderId) ? { ...o, ...updates } : o
      );
      const selectedOrder = state.selectedOrder
        && (state.selectedOrder.id === orderId || state.selectedOrder.order_id === orderId)
        ? { ...state.selectedOrder, ...updates }
        : state.selectedOrder;
      return { ...state, orderHistory, selectedOrder };
    }
    case 'SET_ORDER_HISTORY': return { ...state, orderHistory: action.payload };

    /* ── Notifications ── */
    case 'ADD_NOTIF': {
      const notif = { id: Date.now(), read: false, time: Date.now(), ...action.payload };
      const notifications = [notif, ...state.notifications].slice(0, 50);
      return { ...state, notifications };
    }
    case 'MARK_READ':     return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'MARK_ALL_READ': return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'CLEAR_NOTIFS':  return { ...state, notifications: [] };

    /* ── Wallet ── */
    case 'ADD_WALLET':    return { ...state, wallet: state.wallet + Number(action.payload) };
    case 'DEDUCT_WALLET': return { ...state, wallet: Math.max(0, state.wallet - Number(action.payload)) };

    /* ── Loyalty ── */
    case 'ADD_POINTS': return { ...state, loyaltyPoints: state.loyaltyPoints + Number(action.payload) };

    /* ── Ratings ── */
    case 'RATE_ITEM': return { ...state, ratings: { ...state.ratings, [action.payload.id]: action.payload.stars } };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* Load persisted state */
  useEffect(() => {
    dispatch({ type: 'INIT', payload: loadLocal() });
    const saved = localStorage.getItem('sc_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_PAGE', payload: user.role === 'admin' ? 'admin' : 'home' });
      } catch { localStorage.removeItem('sc_user'); }
    }
  }, []);

  /* Persist to localStorage */
  useEffect(() => { localStorage.setItem('sc_cart',    JSON.stringify(state.cart));          }, [state.cart]);
  useEffect(() => { localStorage.setItem('sc_favs',    JSON.stringify(state.favorites));      }, [state.favorites]);
  useEffect(() => { localStorage.setItem('sc_wish',    JSON.stringify(state.wishlist));        }, [state.wishlist]);
  useEffect(() => { localStorage.setItem('sc_hist',    JSON.stringify(state.orderHistory));    }, [state.orderHistory]);
  useEffect(() => { localStorage.setItem('sc_srch',    JSON.stringify(state.recentSearches));  }, [state.recentSearches]);
  useEffect(() => { localStorage.setItem('sc_wallet',  String(state.wallet));                  }, [state.wallet]);
  useEffect(() => { localStorage.setItem('sc_pts',     String(state.loyaltyPoints));           }, [state.loyaltyPoints]);
  useEffect(() => { localStorage.setItem('sc_ratings', JSON.stringify(state.ratings));         }, [state.ratings]);
  useEffect(() => { localStorage.setItem('sc_notifs',  JSON.stringify(state.notifications.slice(0, 20))); }, [state.notifications]);
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('sc_user', JSON.stringify(state.user));
      localStorage.setItem(`sc_profile_${state.user.username.toLowerCase()}`, JSON.stringify(state.user));
    } else {
      localStorage.removeItem('sc_user');
    }
  }, [state.user]);

  /* Computed */
  const cartCount    = state.cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const promoDiscount = calcPromo(state.promo, cartSubtotal);
  const cartTotal    = Math.max(0, cartSubtotal - promoDiscount);
  const unreadCount  = state.notifications.filter(n => !n.read).length;
  const isAdmin      = state.user?.role === 'admin';
  const activeOrders = state.orderHistory.filter(o => ['Pending','Preparing','Ready'].includes(o.status));

  /* Helpers */
  const toast = useCallback((type, title, msg, duration = 4000) => {
    dispatch({ type: 'ADD_TOAST', payload: { type, title, msg, duration } });
  }, []);

  const navigate = useCallback((page, data = null) => {
    if (data) dispatch({ type: 'SET_SELECTED_ORDER', payload: data });
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const addToCart = useCallback((item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  }, []);

  const getCartQty = useCallback((id) => {
    return state.cart.find(c => String(c.id) === String(id))?.qty || 0;
  }, [state.cart]);

  return (
    <AppContext.Provider value={{
      state, dispatch,
      cartCount, cartSubtotal, cartTotal, promoDiscount,
      unreadCount, isAdmin, activeOrders,
      toast, navigate, addToCart, removeFromCart, getCartQty,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
