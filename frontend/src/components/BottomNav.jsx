import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'home',    icon: '🏠', label: 'Home'    },
  { id: 'search',  icon: '🔍', label: 'Search'  },
  { id: 'cart',    icon: '🛒', label: 'Cart'    },
  { id: 'orders',  icon: '📋', label: 'Orders'  },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav() {
  const { state, dispatch, cartCount, activeOrders } = useApp();
  const { activePage } = state;

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom navigation">
      {NAV_ITEMS.map(item => {
        const isActive = activePage === item.id ||
          (item.id === 'home' && activePage === 'order-detail');
        const badge =
          item.id === 'cart'   ? cartCount :
          item.id === 'orders' ? activeOrders?.length : 0;

        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_PAGE', payload: item.id })}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="bottom-nav-icon">
              <span role="img" aria-hidden="true">{item.icon}</span>
              {badge > 0 && (
                <span className="bottom-nav-badge" aria-label={`${badge} ${item.label}`}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
