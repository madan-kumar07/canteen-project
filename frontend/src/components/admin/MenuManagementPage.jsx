import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Save, X, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetMenu, apiAddItem, apiDeleteItem, apiToggleAvail, apiUpdateItem } from '../../api';
import { VegBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { FoodCardSkeleton } from '../ui/Skeleton';
import { cn, isVeg } from '../../lib/utils';
import { getFoodImage, CATEGORY_CONFIG } from '../../lib/constants';

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

const BLANK_ITEM = { name: '', price: '', category: 'Lunch', image: '', description: '' };

export default function MenuManagementPage() {
  const { navigate, toast } = useApp();
  const [menu, setMenu]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [cat, setCat]           = useState('All');
  const [addOpen, setAddOpen]   = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState(BLANK_ITEM);
  const [saving, setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const data = await apiGetMenu();
      setMenu(Array.isArray(data) ? data : []);
    } catch { toast('error', 'Error', 'Could not load menu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenu(); }, []);

  const filtered = menu.filter(item => {
    const matchCat = cat === 'All' || item.category === cat;
    const matchQ   = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const handleToggle = async (item) => {
    try {
      await apiToggleAvail(item.id);
      setMenu(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i));
    } catch (err) { toast('error', 'Error', err.message); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await apiDeleteItem(item.id);
      setMenu(prev => prev.filter(i => i.id !== item.id));
      toast('success', 'Deleted', `${item.name} removed from menu`);
    } catch (err) { toast('error', 'Error', err.message); }
    finally { setDeletingId(null); }
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      toast('error', 'Missing Fields', 'Name, price and category are required');
      return;
    }
    setSaving(true);
    try {
      const res = await apiAddItem({ ...form, price: Number(form.price) });
      const newItem = res.item || res;
      setMenu(prev => [...prev, newItem]);
      setAddOpen(false);
      setForm(BLANK_ITEM);
      toast('success', 'Added', `${form.name} added to menu`);
    } catch (err) { toast('error', 'Error', err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem || !form.name || !form.price) return;
    setSaving(true);
    try {
      await apiUpdateItem(editItem.id, { ...form, price: Number(form.price) });
      setMenu(prev => prev.map(i => i.id === editItem.id ? { ...i, ...form, price: Number(form.price) } : i));
      setEditItem(null);
      toast('success', 'Updated', `${form.name} updated`);
    } catch (err) { toast('error', 'Error', err.message); }
    finally { setSaving(false); }
  };

  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, price: item.price, category: item.category, image: item.image || '', description: item.description || '' }); };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 pb-10 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('admin')} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-h1">Menu Management</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchMenu} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400">
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
            <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => { setForm(BLANK_ITEM); setAddOpen(true); }}>
              Add Item
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-5 flex-wrap">
          {[
            { label: 'Total Items',   value: menu.length },
            { label: 'Available',     value: menu.filter(i => i.available).length, color: 'text-green-500' },
            { label: 'Unavailable',   value: menu.filter(i => !i.available).length, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-xl">
              <span className={cn('text-lg font-bold', s.color || 'text-surface-900 dark:text-surface-50')}>{s.value}</span>
              <span className="text-sm text-surface-400">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 text-sm text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <select
            value={cat}
            onChange={e => setCat(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 text-sm text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <FoodCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className={cn('bg-white dark:bg-surface-900 border rounded-2xl overflow-hidden',
                    item.available ? 'border-surface-100 dark:border-surface-800' : 'border-red-200 dark:border-red-500/20'
                  )}
                >
                  <div className="relative h-32">
                    <img
                      src={getFoodImage(item.name, item.image)}
                      alt={item.name}
                      className={cn('w-full h-full object-cover', !item.available && 'grayscale opacity-60')}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }}
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <VegBadge isVeg={isVeg(item)} />
                    </div>
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full">Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-sm leading-snug">{item.name}</h3>
                      <span className="font-bold text-surface-900 dark:text-surface-50 flex-shrink-0">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-surface-400">{item.category}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleToggle(item)}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-1 justify-center transition-colors',
                          item.available
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        )}
                      >
                        {item.available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-surface-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={addOpen || !!editItem}
        onClose={() => { setAddOpen(false); setEditItem(null); }}
        title={editItem ? 'Edit Item' : 'Add New Item'}
        size="sm"
      >
        <div className="p-5 space-y-4">
          <Input
            label="Item Name *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Chicken Biryani"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (₹) *"
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="e.g. 80"
            />
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Input
            label="Image URL (optional)"
            value={form.image}
            onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
            placeholder="https://..."
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setAddOpen(false); setEditItem(null); }}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={editItem ? handleEdit : handleAdd}>
              {editItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
