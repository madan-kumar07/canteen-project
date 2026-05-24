import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Star, Wallet, Trophy, Settings, LogOut, Plus, Minus, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiGetMenu } from '../../api';
import { useEffect } from 'react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn, formatCurrency, formatDateTime } from '../../lib/utils';
import { getAvatarColor, getFoodImage } from '../../lib/constants';
import { StatusBadge } from '../ui/Badge';

const TOPUP_AMOUNTS = [50, 100, 200, 500];

function StatCard({ icon: Icon, label, value, sub, color = 'text-brand-500' }) {
  return (
    <div className="p-4 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color.replace('text-', 'bg-') + '/10')}>
        <Icon className={cn('w-4.5 h-4.5', color)} />
      </div>
      <p className="text-2xl font-display font-bold text-surface-900 dark:text-surface-50">{value}</p>
      <p className="text-xs text-surface-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-surface-300 dark:text-surface-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { state, dispatch, navigate, toast } = useApp();
  const { user, wallet, loyaltyPoints, orderHistory, favorites } = state;
  const [menu, setMenu]           = useState([]);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  useEffect(() => {
    apiGetMenu().then(d => setMenu(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const totalSpent = orderHistory.reduce((s, o) => s + (o.total || o.total_price || 0), 0);
  const completedOrders = orderHistory.filter(o => o.status === 'Completed').length;
  const favItems = menu.filter(m => favorites.includes(String(m.id)));
  const pointsToNext = 500 - (loyaltyPoints % 500);
  const level = loyaltyPoints < 500 ? 'Bronze' : loyaltyPoints < 2000 ? 'Silver' : 'Gold';

  const handleTopup = () => {
    const amount = Number(topupAmount);
    if (!amount || amount < 10) { toast('error', 'Invalid Amount', 'Minimum top-up is ₹10'); return; }
    dispatch({ type: 'ADD_WALLET', payload: amount });
    toast('success', 'Wallet Topped Up!', `₹${amount} added to your wallet`);
    setTopupOpen(false);
    setTopupAmount('');
  };

  const handleLogout = () => {
    localStorage.removeItem('sc_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <>
      <div className="max-w-lg mx-auto pb-24 px-4 pt-4">

        {/* Profile Header */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-surface-900 via-surface-900 to-surface-950 mb-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-brand-500/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <Avatar name={user?.displayName || user?.username || 'U'} colorOverride={user?.avatarColor} imageSrc={user?.profilePic} size="xl" />
            <div className="flex-1">
              <h1 className="text-white font-display font-bold text-xl">{user?.displayName || user?.username}</h1>
              <p className="text-surface-400 text-sm capitalize mt-0.5">{user?.role} Account</p>
              <div className="flex items-center gap-2 mt-3">
                <div className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold',
                  level === 'Gold' ? 'bg-amber-500/20 text-amber-400' :
                  level === 'Silver' ? 'bg-surface-400/20 text-surface-300' : 'bg-orange-500/20 text-orange-400'
                )}>
                  {level} Member
                </div>
                <span className="text-surface-500 text-xs">{loyaltyPoints} pts</span>
              </div>
              {/* Points progress */}
              <div className="mt-3">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${((loyaltyPoints % 500) / 500) * 100}%` }}
                  />
                </div>
                <p className="text-surface-500 text-[10px] mt-1">{pointsToNext} pts to {level === 'Gold' ? 'max' : 'next level'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={ShoppingBag} label="Total Orders"    value={orderHistory.length}       sub={`${completedOrders} completed`}    color="text-blue-500"  />
          <StatCard icon={TrendingUp}  label="Total Spent"     value={formatCurrency(totalSpent)} sub="lifetime spend"                   color="text-green-500" />
          <StatCard icon={Trophy}      label="Loyalty Points"  value={loyaltyPoints}              sub={`${level} tier`}                   color="text-amber-500" />
          <StatCard icon={Heart}       label="Favorites"       value={favItems.length}            sub="saved items"                       color="text-red-500"   />
        </div>

        {/* Wallet */}
        <div className="p-5 bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-brand-500" /> Canteen Wallet
            </h2>
            <span className="text-2xl font-display font-bold text-brand-500">{formatCurrency(wallet)}</span>
          </div>
          <div className="flex gap-2">
            {TOPUP_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => { dispatch({ type: 'ADD_WALLET', payload: amt }); toast('success', 'Topped up!', `₹${amt} added`); }}
                className="flex-1 py-2 text-sm font-semibold text-brand-500 border border-brand-500/30 rounded-xl hover:bg-brand-500/10 transition-colors"
              >+₹{amt}</button>
            ))}
          </div>
          <button
            onClick={() => setTopupOpen(true)}
            className="w-full mt-2.5 py-2 text-sm font-semibold text-surface-500 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >Custom Amount</button>
        </div>

        {/* Favorites */}
        {favItems.length > 0 && (
          <div className="mb-5">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Favorites
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {favItems.slice(0, 6).map(item => (
                <div key={item.id} className="flex-shrink-0 w-32 rounded-2xl overflow-hidden border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900">
                  <div className="h-20 relative">
                    <img
                      src={getFoodImage(item.name, item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'; }}
                    />
                    <button
                      onClick={() => dispatch({ type: 'TOGGLE_FAV', payload: String(item.id) })}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center"
                    ><span className="text-[10px]">❤️</span></button>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-surface-900 dark:text-surface-100 line-clamp-1">{item.name}</p>
                    <p className="text-xs font-bold text-brand-500 mt-0.5">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {orderHistory.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title flex items-center gap-2">
                <Clock className="w-4 h-4 text-surface-400" /> Order History
              </h2>
              <button onClick={() => navigate('orders')} className="text-xs text-brand-500 font-semibold">See all</button>
            </div>
            <div className="space-y-2.5">
              {orderHistory.slice(0, 3).map((order, i) => (
                <div
                  key={order.id || i}
                  onClick={() => navigate('order-detail', order)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 cursor-pointer hover:shadow-card transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-500">#{order.token || order.token_number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                      {order.items?.map(i => i.name).join(', ') || 'Order'}
                    </p>
                    <p className="text-xs text-surface-400">{formatDateTime(order.placedAt || order.timestamp)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-surface-900 dark:text-surface-50">{formatCurrency(order.total || order.total_price)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('settings')}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 hover:shadow-card transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
              <Settings className="w-4 h-4 text-surface-500" />
            </div>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 hover:shadow-card transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-500">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Custom topup modal */}
      <Modal open={topupOpen} onClose={() => setTopupOpen(false)} title="Add Money to Wallet" size="sm">
        <div className="p-5 space-y-4">
          <input
            type="number"
            value={topupAmount}
            onChange={e => setTopupAmount(e.target.value)}
            placeholder="Enter amount (min ₹10)"
            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
          <Button variant="primary" className="w-full" onClick={handleTopup}>
            Add {topupAmount ? formatCurrency(Number(topupAmount)) : 'Money'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
