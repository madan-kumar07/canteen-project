import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { QtyCtrl, getCatConfig, isVegItem, VegDot } from '../utils/ui';
import { getMenu } from '../api';

const TRENDING_TAGS = ['Biryani', 'Dosa', 'Noodles', 'Chicken 65', 'Juice', 'Panipuri', 'Parotta', 'Tea'];
const FILTERS = [
  { id: 'all',     label: '✨ All'          },
  { id: 'veg',     label: '🟢 Veg Only'     },
  { id: 'under50', label: '💰 Under ₹50'    },
  { id: 'top',     label: '⭐ Top Rated'    },
  { id: 'avail',   label: '✅ Available'    },
];

export default function SearchPage() {
  const { state, dispatch, navigate } = useApp();
  const [menu,       setMenu]       = useState([]);
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [activeFilter, setFilter]  = useState('all');
  const inputRef = useRef(null);

  /* Auto-focus */
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* Load menu */
  useEffect(() => {
    setLoading(true);
    getMenu()
      .then(data => setMenu(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Debounced search */
  useEffect(() => {
    const tid = setTimeout(() => {
      if (!query.trim()) { setResults([]); return; }
      const q = query.toLowerCase();
      let filtered = menu.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
      filtered = applyFilter(filtered, activeFilter);
      setResults(filtered);
    }, 200);
    return () => clearTimeout(tid);
  }, [query, menu, activeFilter]);

  function applyFilter(items, f) {
    switch (f) {
      case 'veg':     return items.filter(i => isVegItem(i));
      case 'under50': return items.filter(i => i.price < 50);
      case 'top':     return items.filter(i => i.available);
      case 'avail':   return items.filter(i => i.available);
      default:        return items;
    }
  }

  const handleSearch = (q) => {
    setQuery(q);
    if (q.trim()) dispatch({ type: 'ADD_SEARCH', payload: q.trim() });
  };

  const searchTag = (tag) => {
    setQuery(tag);
    dispatch({ type: 'ADD_SEARCH', payload: tag });
    inputRef.current?.focus();
  };

  const getQty = (id) => state.cart.find(c => String(c.id) === String(id))?.qty || 0;
  const addItem = (item) => dispatch({ type: 'ADD_TO_CART', payload: { item } });
  const remItem = (id)   => dispatch({ type: 'REMOVE_FROM_CART', payload: id });

  const highlight = (text, q) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="search-highlight" style={{ background: 'transparent' }}>{part}</mark>
        : part
    );
  };

  return (
    <div className="search-page">
      {/* ── Search Input ── */}
      <div className="search-input-wrap">
        <button
          onClick={() => navigate('home')}
          style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', marginBottom: 10, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          aria-label="Back to home"
        >
          ← Back
        </button>
        <div className="search-input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className="search-real-input"
            type="search"
            placeholder="Search dishes, snacks, beverages…"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            aria-label="Search for food"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1rem', padding: 4 }}
              aria-label="Clear search"
            >✕</button>
          )}
        </div>

        {/* Filters */}
        <div className="search-filter-row" role="toolbar" aria-label="Search filters">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`filter-chip ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
              aria-pressed={activeFilter === f.id}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      {query ? (
        results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>No results for "{query}"</div>
            <div style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>Try searching something else</div>
          </div>
        ) : (
          <div role="list" aria-label={`${results.length} results`}>
            <div style={{ padding: '0 var(--s5)', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 600 }}>
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </span>
            </div>
            {results.map(item => {
              const qty = getQty(item.id);
              const veg = isVegItem(item);
              return (
                <div key={item.id} className="search-result-item" role="listitem">
                  {item.image
                    ? <img className="search-result-img" src={item.image} alt={item.name} loading="lazy"
                        onError={e => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                    : null}
                  <div className="search-result-img-ph" style={{ display: item.image ? 'none' : 'flex' }}>
                    {getCatConfig(item.category).emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <VegDot isVeg={veg} />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {highlight(item.name, query)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4 }}>
                      {highlight(item.category, query)}
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--coral)' }}>₹{item.price}</div>
                  </div>
                  <div>
                    {item.available
                      ? qty > 0
                        ? <QtyCtrl qty={qty} onAdd={() => addItem(item)} onRemove={() => remItem(item.id)} />
                        : <button className="add-btn" onClick={() => addItem(item)}>+ Add</button>
                      : <span style={{ fontSize: '0.75rem', color: 'var(--text4)' }}>Sold out</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div style={{ padding: '0 var(--s5)' }}>
          {/* Recent Searches */}
          {state.recentSearches.length > 0 && (
            <div style={{ marginBottom: 'var(--s6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s3)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Recent Searches
                </div>
                <button
                  onClick={() => dispatch({ type: 'CLEAR_SEARCHES' })}
                  style={{ fontSize: '0.75rem', color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >Clear all</button>
              </div>
              {state.recentSearches.map(s => (
                <div
                  key={s}
                  className="search-recent-item"
                  onClick={() => searchTag(s)}
                  role="button"
                  tabIndex={0}
                >
                  <span style={{ color: 'var(--text4)' }}>🕐</span>
                  <span style={{ flex: 1 }}>{s}</span>
                  <button
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_SEARCH', payload: s }); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text4)', cursor: 'pointer', fontSize: '0.9rem' }}
                    aria-label={`Remove ${s} from recent searches`}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Trending Tags */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--s3)' }}>
              🔥 Trending
            </div>
            <div className="trending-chips">
              {TRENDING_TAGS.map(tag => (
                <button
                  key={tag}
                  className="trending-chip"
                  onClick={() => searchTag(tag)}
                  aria-label={`Search for ${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
