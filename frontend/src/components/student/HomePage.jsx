import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, TrendingUp, Clock, Star, RefreshCw, Tag, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetMenu, apiRecommend } from '../../api';
import { FoodCardSkeleton } from '../ui/Skeleton';
import { Badge, VegBadge, StatusBadge } from '../ui/Badge';
import { QtyControl, AddButton } from '../ui/Avatar';
import { cn, getGreeting, isVeg, getRushInfo, formatCurrency } from '../../lib/utils';
import { getCatConfig, getFoodImage, CANTEEN_INFO } from '../../lib/constants';

const OFFERS = [
  { code: 'FIRST50',   title: '50% Off', desc: 'On your first order',  color: 'from-orange-500 to-red-500' },
  { code: 'CANTEEN20', title: '20% Off', desc: 'On all orders today',  color: 'from-blue-500 to-cyan-500'  },
  { code: 'SAVE15',    title: '15% Off', desc: 'On orders above ₹100', color: 'from-purple-500 to-pink-500' },
  { code: 'WELCOME10', title: '₹10 Off', desc: 'Welcome bonus',        color: 'from-green-500 to-teal-500' },
];

function FoodCard({ item, qty, onAdd, onRemove, isFav, onFav }) {
  const veg = isVeg(item);
  const img = getFoodImage(item.name, item.image);
  const rating = ((3.5 + (parseInt(item.id, 10) % 15) * 0.1)).toFixed(1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative flex bg-white dark:bg-surface-900',
        'border border-surface-100 dark:border-surface-800',
        'rounded-2xl overflow-hidden',
        'hover:shadow-elevated hover:-translate-y-0.5',
        'transition-all duration-200',
        !item.available && 'opacity-60'
      )}
    >
      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <VegBadge isVeg={veg} />
            {item.category === 'Night' && item.name.includes('Chicken') && (
              <Badge variant="brand" className="text-[10px] py-0.5 px-2">Bestseller</Badge>
            )}
          </div>
          <h3 className="font-semibold text-surface-900 dark:text-surface-50 text-sm leading-snug">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-500" /> {rating}
            </span>
            <span className="text-[11px] text-surface-400">· {item.category}</span>
          </div>
          {item.available && (
            <p className="text-[11px] text-surface-400 mt-1 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> 8–12 min
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-bold text-surface-900 dark:text-surface-50">₹{item.price}</span>
          {item.available
            ? qty > 0
              ? <QtyControl qty={qty} onAdd={onAdd} onRemove={onRemove} />
              : <AddButton onClick={onAdd} />
            : <span className="text-xs text-surface-400 font-medium px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-xl">Sold Out</span>
          }
        </div>
      </div>

      {/* Image */}
      <div className="relative w-28 flex-shrink-0">
        <img
          src={img}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'; }}
        />
        {!item.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-lg">SOLD OUT</span>
          </div>
        )}
        <button
          onClick={onFav}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          aria-label="Toggle favorite"
        >
          <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { state, dispatch, cartCount, cartTotal, navigate, addToCart, removeFromCart, getCartQty, toast } = useApp();
  const [menu, setMenu]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [pendingCount, setPendingCount] = useState(2);
  const catScrollRef = useRef(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await apiGetMenu();
      setMenu(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // Real-time menu updates
  useEffect(() => {
    const onItem = e => {
      const { id, available } = e.detail;
      setMenu(prev => prev.map(i => String(i.id) === String(id) ? { ...i, available } : i));
    };
    const onRefresh = e => { if (Array.isArray(e.detail)) setMenu(e.detail); };
    const onQueue   = e => { if (e.detail?.waiting_orders != null) setPendingCount(e.detail.waiting_orders); };
    window.addEventListener('sc:menu_item',   onItem);
    window.addEventListener('sc:menu_refresh', onRefresh);
    window.addEventListener('sc:queue',        onQueue);
    return () => {
      window.removeEventListener('sc:menu_item',   onItem);
      window.removeEventListener('sc:menu_refresh', onRefresh);
      window.removeEventListener('sc:queue',        onQueue);
    };
  }, []);

  const categories = ['All', ...new Set(menu.map(i => i.category).filter(Boolean))];
  const filtered   = activeCategory === 'All' ? menu : menu.filter(i => i.category === activeCategory);

  const rushInfo = getRushInfo(pendingCount);
  const trendingItems = menu.filter(i => i.available).slice(0, 8);
  const recentOrders  = state.orderHistory.slice(0, 3);
  const todaysSpecial = menu.find(i => i.available && i.price >= 60) || menu[0];

  const handleApplyPromo = (code) => {
    dispatch({ type: 'APPLY_PROMO', payload: code });
    navigate('cart');
    toast('success', 'Promo Applied!', `${code} added to your cart`);
  };

  const handleReorder = (order) => {
    order.items?.forEach(item => {
      for (let q = 0; q < (item.qty || 1); q++) addToCart(item);
    });
    toast('success', 'Added to cart!', `${order.items?.length || 0} items added`);
    navigate('cart');
  };

  return (
    <div className="pb-20 md:pb-6">

      {/* ── Hero Section ── */}
      <div className="bg-gradient-to-br from-surface-900 via-surface-950 to-black px-4 pt-6 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-brand-500/5 blur-2xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-surface-400 text-sm font-medium mb-1"
          >
            {getGreeting()}, {state.user?.username || 'there'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-white font-display font-extrabold text-2xl md:text-3xl leading-tight mb-4"
          >
            What would you like<br />
            <span className="gradient-text">to eat today?</span>
          </motion.h1>

          {/* Rush Meter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Zap className={cn('w-4 h-4', rushInfo.color)} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs font-semibold">{rushInfo.label}</span>
                <span className="text-surface-400 text-xs">{rushInfo.eta} est. wait</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rushInfo.percent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', rushInfo.bar)}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-surface-400 text-[10px]">Queue</p>
              <p className={cn('text-base font-bold', rushInfo.color)}>{pendingCount}</p>
            </div>
          </motion.div>

          {/* Search pill */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate('search')}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-left hover:bg-white/15 transition-colors"
          >
            <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-surface-400 text-sm">Search dishes, beverages...</span>
          </motion.button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto md:max-w-4xl lg:max-w-6xl">

        {/* ── Offers Carousel ── */}
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Offers & Deals</h2>
            <button onClick={() => navigate('cart')} className="text-xs text-brand-500 font-semibold flex items-center gap-1">
              All deals <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {OFFERS.map((offer, i) => (
              <motion.div
                key={offer.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleApplyPromo(offer.code)}
                className={cn(
                  'flex-shrink-0 w-44 p-4 rounded-2xl cursor-pointer',
                  'bg-gradient-to-br', offer.color,
                  'hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150'
                )}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <Tag className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Promo</span>
                </div>
                <p className="text-white font-display font-extrabold text-2xl leading-none">{offer.title}</p>
                <p className="text-white/75 text-xs mt-1">{offer.desc}</p>
                <div className="mt-3 px-2 py-1 bg-white/20 rounded-lg inline-block">
                  <span className="text-white text-[10px] font-bold tracking-wider">{offer.code}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Quick Reorder ── */}
        {recentOrders.length > 0 && (
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-brand-500" /> Quick Reorder
              </h2>
              <button onClick={() => navigate('orders')} className="text-xs text-brand-500 font-semibold flex items-center gap-1">
                All orders <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {recentOrders.map((order, i) => (
                <motion.div
                  key={order.id || i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleReorder(order)}
                  className="flex-shrink-0 w-52 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={order.status} />
                    <span className="text-xs text-surface-400">#{order.token}</span>
                  </div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 line-clamp-2 leading-snug">
                    {order.items?.map(i => i.name).join(', ') || 'Previous order'}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-surface-900 dark:text-surface-50">₹{order.total}</span>
                    <span className="text-xs text-brand-500 font-bold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Reorder
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Today's Special ── */}
        {!loading && todaysSpecial && (
          <div className="mt-6 px-4">
            <h2 className="section-title mb-3">Today's Special</h2>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-900 to-surface-800 flex items-stretch min-h-32">
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <Badge variant="brand" className="mb-2">Today's Special</Badge>
                  <h3 className="text-white font-display font-bold text-xl leading-tight">{todaysSpecial.name}</h3>
                  <p className="text-surface-400 text-sm mt-1">Fresh · Delicious · Ready in 10 min</p>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-white font-bold text-xl">₹{todaysSpecial.price}</span>
                  {getCartQty(todaysSpecial.id) > 0
                    ? <QtyControl
                        qty={getCartQty(todaysSpecial.id)}
                        onAdd={() => addToCart(todaysSpecial)}
                        onRemove={() => removeFromCart(todaysSpecial.id)}
                      />
                    : <button
                        onClick={() => addToCart(todaysSpecial)}
                        className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
                      >Order Now</button>
                  }
                </div>
              </div>
              <div className="w-32 relative flex-shrink-0">
                <img
                  src={getFoodImage(todaysSpecial.name, todaysSpecial.image)}
                  alt={todaysSpecial.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'; }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Trending ── */}
        {!loading && trendingItems.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3 px-4">
              <h2 className="section-title flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" /> Trending Now
              </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
              {trendingItems.slice(0, 6).map((item, i) => {
                const qty = getCartQty(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex-shrink-0 w-36 rounded-2xl overflow-hidden bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 hover:shadow-elevated transition-all duration-200"
                  >
                    <div className="relative h-24">
                      <img
                        src={getFoodImage(item.name, item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'; }}
                      />
                      <div className="absolute top-2 left-2">
                        <VegBadge isVeg={isVeg(item)} />
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 line-clamp-1">{item.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-surface-900 dark:text-surface-50">₹{item.price}</span>
                        {qty > 0
                          ? <QtyControl qty={qty} onAdd={() => addToCart(item)} onRemove={() => removeFromCart(item.id)} size="sm" />
                          : <button onClick={() => addToCart(item)} className="text-brand-500 text-xs font-bold border border-brand-500 px-2 py-1 rounded-lg hover:bg-brand-500 hover:text-white transition-colors">+ Add</button>
                        }
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Category Tabs ── */}
        {!loading && (
          <div className="mt-6 sticky top-14 z-20 bg-surface-50/95 dark:bg-surface-950/95 backdrop-blur-xl py-3 border-b border-surface-100 dark:border-surface-800/50">
            <div ref={catScrollRef} className="flex gap-2 overflow-x-auto no-scrollbar px-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                    activeCategory === cat
                      ? 'bg-brand-500 text-white shadow-brand-sm'
                      : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:border-brand-500/50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Menu Grid ── */}
        <div className="px-4 mt-4">
          {loading ? (
            <div className="space-y-3">
              {Array(6).fill(0).map((_, i) => <FoodCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-surface-400 mb-4">Could not load menu</p>
              <button onClick={fetchMenu} className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-surface-400">No items in this category</p>
            </div>
          ) : activeCategory === 'All' ? (
            categories.filter(c => c !== 'All').map(cat => {
              const catItems = menu.filter(i => i.category === cat);
              if (!catItems.length) return null;
              const cfg = getCatConfig(cat);
              return (
                <div key={cat} id={`cat-${cat}`} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-base', cfg.color)}>
                      {cfg.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-surface-100">{cat}</h3>
                      <p className="text-xs text-surface-400">{catItems.filter(i => i.available).length} available</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {catItems.map(item => (
                      <FoodCard
                        key={item.id}
                        item={item}
                        qty={getCartQty(item.id)}
                        onAdd={() => addToCart(item)}
                        onRemove={() => removeFromCart(item.id)}
                        isFav={state.favorites.includes(String(item.id))}
                        onFav={() => dispatch({ type: 'TOGGLE_FAV', payload: String(item.id) })}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-3">
              {filtered.map(item => (
                <FoodCard
                  key={item.id}
                  item={item}
                  qty={getCartQty(item.id)}
                  onAdd={() => addToCart(item)}
                  onRemove={() => removeFromCart(item.id)}
                  isFav={state.favorites.includes(String(item.id))}
                  onFav={() => dispatch({ type: 'TOGGLE_FAV', payload: String(item.id) })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Cart Bar ── */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{ y: 100,    opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed bottom-16 md:bottom-4 left-4 right-4 z-30 max-w-md mx-auto"
          >
            <button
              onClick={() => navigate('cart')}
              className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl shadow-brand hover:shadow-brand hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white text-xs font-medium">{cartCount} item{cartCount > 1 ? 's' : ''}</p>
                  <p className="text-white/80 text-[10px]">Tap to review order</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{formatCurrency(cartTotal)}</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
