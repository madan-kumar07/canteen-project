import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, SlidersHorizontal, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetMenu } from '../../api';
import { VegBadge } from '../ui/Badge';
import { QtyControl, AddButton } from '../ui/Avatar';
import { cn, isVeg, formatCurrency } from '../../lib/utils';
import { getFoodImage } from '../../lib/constants';
import { FoodCardSkeleton } from '../ui/Skeleton';

const FILTERS = ['All', 'Veg', 'Non-Veg', 'Under ₹30', 'Under ₹60', 'Available'];
const SORTS   = ['Relevance', 'Price: Low', 'Price: High', 'Name A-Z'];

function highlight(text, query) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>{text.slice(0, idx)}<mark className="bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>
  );
}

export default function SearchPage() {
  const { state, dispatch, addToCart, removeFromCart, getCartQty } = useApp();
  const [menu, setMenu]        = useState([]);
  const [query, setQuery]      = useState('');
  const [filter, setFilter]    = useState('All');
  const [sort, setSort]        = useState('Relevance');
  const [loading, setLoading]  = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    apiGetMenu().then(d => setMenu(Array.isArray(d) ? d : []));
  }, []);

  // Save recent searches on submit
  const commitSearch = useCallback((q) => {
    if (q.trim().length >= 2) {
      dispatch({ type: 'ADD_SEARCH', payload: q.trim() });
    }
  }, [dispatch]);

  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim().length >= 2) commitSearch(val.trim());
    }, 1000);
  };

  /* Filtering + sorting */
  const results = menu.filter(item => {
    const q = query.toLowerCase();
    const matchQ = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    if (!matchQ) return false;
    switch (filter) {
      case 'Veg':      return isVeg(item);
      case 'Non-Veg':  return !isVeg(item);
      case 'Under ₹30': return item.price <= 30;
      case 'Under ₹60': return item.price <= 60;
      case 'Available': return item.available;
      default:         return true;
    }
  }).sort((a, b) => {
    switch (sort) {
      case 'Price: Low':  return a.price - b.price;
      case 'Price: High': return b.price - a.price;
      case 'Name A-Z':    return a.name.localeCompare(b.name);
      default:            return 0;
    }
  });

  const TRENDING = ['Biryani', 'Noodles', 'Dosa', 'Fried Rice', 'Chicken', 'Juice', 'Coffee'];

  return (
    <div className="max-w-2xl mx-auto pb-24">

      {/* Search bar */}
      <div className="sticky top-14 z-20 bg-surface-50/95 dark:bg-surface-950/95 backdrop-blur-xl px-4 py-3 border-b border-surface-100 dark:border-surface-800/50">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && commitSearch(query)}
            placeholder="Search dishes, snacks, beverages..."
            className="w-full pl-10 pr-20 py-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-900 dark:text-surface-50 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all text-sm font-medium"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn('p-1.5 rounded-xl transition-colors', showFilters ? 'bg-brand-500 text-white' : 'text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800')}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            {query && (
              <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="p-1.5 text-surface-400 hover:text-surface-600 rounded-xl">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {FILTERS.map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                        filter === f ? 'bg-brand-500 text-white' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {SORTS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                        sort === s ? 'bg-surface-900 dark:bg-white text-white dark:text-surface-900' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 mt-4">
        {/* Empty — show trending + recent */}
        {!query && (
          <div className="space-y-6">
            {/* Recent searches */}
            {state.recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-surface-400" /> Recent Searches
                  </h3>
                  <button
                    onClick={() => dispatch({ type: 'CLEAR_SEARCHES' })}
                    className="text-xs text-brand-500 font-semibold"
                  >Clear all</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.recentSearches.map((s, i) => (
                    <button
                      key={i}
                      className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 text-sm text-surface-700 dark:text-surface-300 hover:border-brand-500/40 transition-colors"
                    >
                      <Clock className="w-3 h-3 text-surface-400" />
                      <span onClick={() => handleQueryChange(s)}>{s}</span>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_SEARCH', payload: s })}
                        className="text-surface-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending searches */}
            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-brand-500" /> Trending
              </h3>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map(t => (
                  <button
                    key={t}
                    onClick={() => handleQueryChange(t)}
                    className="px-4 py-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium hover:bg-brand-500/20 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* All items quick view */}
            <div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">All Menu Items</h3>
              <div className="space-y-3">
                {menu.slice(0, 8).map(item => {
                  const qty = getCartQty(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 hover:shadow-card transition-all"
                    >
                      <img
                        src={getFoodImage(item.name, item.image)}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <VegBadge isVeg={isVeg(item)} />
                          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{item.name}</p>
                        </div>
                        <p className="text-xs text-surface-400">{item.category}</p>
                        <p className="text-sm font-bold text-surface-900 dark:text-surface-50 mt-1">₹{item.price}</p>
                      </div>
                      {item.available
                        ? qty > 0
                          ? <QtyControl qty={qty} onAdd={() => addToCart(item)} onRemove={() => removeFromCart(item.id)} size="sm" />
                          : <AddButton onClick={() => addToCart(item)} />
                        : <span className="text-xs text-surface-400 px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg">Unavailable</span>
                      }
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Search results */}
        {query && (
          <>
            <p className="text-xs text-surface-400 font-semibold mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              {filter !== 'All' && ` · ${filter}`}
            </p>
            {results.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-surface-400" />
                </div>
                <p className="text-surface-900 dark:text-surface-100 font-semibold mb-2">Nothing found</p>
                <p className="text-surface-400 text-sm">Try a different search or remove filters</p>
                <button onClick={() => { setQuery(''); setFilter('All'); }} className="mt-4 px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm">Clear Search</button>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((item, i) => {
                  const qty = getCartQty(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl overflow-hidden hover:shadow-elevated hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <VegBadge isVeg={isVeg(item)} />
                          <span className="text-[10px] text-surface-400">{item.category}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                          {highlight(item.name, query)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] text-surface-400">4.{Math.abs(parseInt(item.id) % 5) + 1}</span>
                          <Clock className="w-3 h-3 text-surface-400 ml-1" />
                          <span className="text-[11px] text-surface-400">8–12 min</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-base font-bold text-surface-900 dark:text-surface-50">₹{item.price}</span>
                          {item.available
                            ? qty > 0
                              ? <QtyControl qty={qty} onAdd={() => addToCart(item)} onRemove={() => removeFromCart(item.id)} />
                              : <AddButton onClick={() => addToCart(item)} />
                            : <span className="text-xs text-surface-400 font-medium px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-xl">Sold Out</span>
                          }
                        </div>
                      </div>
                      <div className="w-28 flex-shrink-0">
                        <img
                          src={getFoodImage(item.name, item.image)}
                          alt={item.name}
                          className={cn('w-full h-full object-cover', !item.available && 'opacity-50 grayscale')}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'; }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
