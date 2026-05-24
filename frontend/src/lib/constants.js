// ─── Promo Codes ──────────────────────────────────────────────
export const PROMO_CODES = {
  FIRST50:   { discount: 50, label: '50% off (max ₹50)',   type: 'percent', maxDiscount: 50  },
  CANTEEN20: { discount: 20, label: '20% off (max ₹100)',  type: 'percent', maxDiscount: 100 },
  WELCOME10: { discount: 10, label: 'Flat ₹10 off',        type: 'flat',    maxDiscount: 10  },
  SAVE15:    { discount: 15, label: '15% off on ₹100+',    type: 'percent', maxDiscount: 30, minOrder: 100 },
};

// ─── Pickup Slots ─────────────────────────────────────────────
export const PICKUP_SLOTS = [
  { id: 'asap', label: 'As Soon As Possible', sub: '8–15 min'  },
  { id: 'slot1',label: '12:30 PM',            sub: '~30 min'   },
  { id: 'slot2',label: '12:45 PM',            sub: '~45 min'   },
  { id: 'slot3',label: '01:00 PM',            sub: '~60 min'   },
];

// ─── Payment Methods ──────────────────────────────────────────
export const PAYMENT_METHODS = [
  { id: 'counter', icon: '🏪', label: 'Pay at Counter', sub: 'Cash on pickup'  },
  { id: 'online',  icon: '💳', label: 'UPI / Card',     sub: 'Razorpay secure' },
  { id: 'wallet',  icon: '👛', label: 'Wallet',         sub: 'Instant pay'     },
];

// ─── Order Status Flow ────────────────────────────────────────
export const STATUS_FLOW = {
  Pending:   'Preparing',
  Preparing: 'Ready',
  Ready:     'Completed',
};

export const ORDER_TIMELINE = [
  { key: 'Pending',   label: 'Order Placed',     sub: 'Your order has been received'         },
  { key: 'Preparing', label: 'Preparing',         sub: 'Our chef is preparing your meal'      },
  { key: 'Ready',     label: 'Ready for Pickup',  sub: 'Your order is ready at the counter'   },
  { key: 'Completed', label: 'Completed',         sub: 'Enjoy your meal!'                     },
];

// ─── Category Config ──────────────────────────────────────────
export const CATEGORY_CONFIG = {
  'Morning Snacks': { color: 'from-amber-500 to-orange-500',    bg: 'bg-amber-500/10',  icon: '🌅', time: '8–10 AM'  },
  'Lunch':          { color: 'from-green-500 to-emerald-500',   bg: 'bg-green-500/10',  icon: '🍛', time: '12–2 PM'  },
  'Chaat Items':    { color: 'from-pink-500 to-rose-500',       bg: 'bg-pink-500/10',   icon: '🥗', time: '3–6 PM'   },
  'Snacks':         { color: 'from-purple-500 to-violet-500',   bg: 'bg-purple-500/10', icon: '🍟', time: '4–6 PM'   },
  'Fresh Juices':   { color: 'from-blue-500 to-cyan-500',       bg: 'bg-blue-500/10',   icon: '🥤', time: 'All Day'   },
  'Soup Items':     { color: 'from-red-500 to-orange-500',      bg: 'bg-red-500/10',    icon: '🍲', time: '12–2 PM'  },
  'Night':          { color: 'from-indigo-500 to-purple-500',   bg: 'bg-indigo-500/10', icon: '🌙', time: '7–10 PM'  },
  'Starters':       { color: 'from-orange-500 to-red-500',      bg: 'bg-orange-500/10', icon: '🍗', time: '6–9 PM'   },
};

export function getCatConfig(cat) {
  return CATEGORY_CONFIG[cat] || { color: 'from-surface-400 to-surface-500', bg: 'bg-surface-100 dark:bg-surface-800', icon: '🍽', time: '' };
}

// ─── Food Images (curated realistic Unsplash) ─────────────────
export const FOOD_IMAGES = {
  // Snacks & Breakfast
  'Vadai':            'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=85',
  'Bonda':            'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=85',
  'Egg Puffs':        'https://images.unsplash.com/photo-1666711688375-74a7a60b5e97?w=600&q=85',
  'Veg Puffs':        'https://images.unsplash.com/photo-1666711688375-74a7a60b5e97?w=600&q=85',
  'Jam Bun':          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=85',
  'Butter Bun':       'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=85',
  'Tea':              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85',
  'Coffee':           'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=85',

  // Lunch
  'Chapati':          'https://images.unsplash.com/photo-1565557612627-fa85cf2153fa?w=600&q=85',
  'Parotta':          'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=85',
  'Curd Rice':        'https://images.unsplash.com/photo-1626374965325-10eb0c50d40e?w=600&q=85',
  'Sambar Rice':      'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=600&q=85',
  'Veg Fried Rice':   'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=85',
  'Chicken Fried Rice':'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=85',
  'Veg Noodles':      'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=85',
  'Chicken Noodles':  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=85',
  'Egg Biryani':      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=85',
  'Chicken Biryani':  'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=600&q=85',
  'Plain Biryani':    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=85',
  'Boiled Egg':       'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=85',
  'Omelet':           'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=85',

  // Chaat
  'Panipuri (6 Pcs)': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=85',
  'Bhel Puri':        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=85',

  // Juices
  'Water Melon':      'https://images.unsplash.com/photo-1587883012610-e3df17d41270?w=600&q=85',
  'Lemon Mint':       'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=85',
  'Ginger Lemon':     'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=85',

  // Soup
  'Veg Soup':         'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=85',
  'Mushroom Soup':    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=85',
  'Chicken Soup':     'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&q=85',

  // Dosas (Night)
  'Kal Dosai - Sambar & Chutney': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=85',
  'Plain Dosai':      'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=600&q=85',
  'Egg Dosai':        'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=85',
  'Onion Dosai':      'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=85',
  'Podi Dosai':       'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=85',

  // Starters
  'Chicken Wings (2 Pcs)':  'https://images.unsplash.com/photo-1569058242253-1df34b084afa?w=600&q=85',
  'Chicken Lolipop (2 Pcs)':'https://images.unsplash.com/photo-1569058242253-1df34b084afa?w=600&q=85',
  'Chicken Boneless (5 Pcs)':'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&q=85',
  'French Fries':     'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&q=85',
  'Gopi 65':          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85',
  'Chicken 65':       'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&q=85',

  // Default fallback
  '_default':         'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85',
};

export function getFoodImage(name, backendImage) {
  if (FOOD_IMAGES[name]) return FOOD_IMAGES[name];
  if (backendImage && !backendImage.includes('placeholder')) return backendImage;
  return FOOD_IMAGES['_default'];
}

// ─── Canteen Info ─────────────────────────────────────────────
export const CANTEEN_INFO = {
  name:    'Campus Canteen',
  college: 'JJ College of Engineering',
  timings: [
    { session: 'Morning Snacks', time: '8:00 AM – 10:00 AM' },
    { session: 'Lunch',          time: '12:00 PM – 2:00 PM' },
    { session: 'Evening Snacks', time: '4:00 PM – 6:00 PM'  },
    { session: 'Dinner',         time: '7:00 PM – 10:00 PM' },
  ],
};

// ─── Avatar Colors ─────────────────────────────────────────────
export const AVATAR_COLORS = [
  'from-orange-400 to-red-500',
  'from-blue-400 to-indigo-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-blue-500',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-500',
];

export function getAvatarColor(username = '') {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = ((hash << 5) - hash + username.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
