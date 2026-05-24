import { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp }     from './context/AppContext';
import { ThemeProvider }           from './context/ThemeContext';
import { SocketProvider }          from './context/SocketContext';
import { ToastContainer }          from './components/ui/Toast';
import Navbar                      from './components/layout/Navbar';
import Sidebar                     from './components/layout/Sidebar';
import BottomNav                   from './components/layout/BottomNav';
import LoginPage                   from './components/LoginPage';

// Lazy load pages for code splitting
const HomePage       = lazy(() => import('./components/student/HomePage'));
const SearchPage     = lazy(() => import('./components/student/SearchPage'));
const CartPage       = lazy(() => import('./components/student/CartPage'));
const OrdersPage     = lazy(() => import('./components/student/OrdersPage'));
const OrderDetail    = lazy(() => import('./components/student/OrderDetailPage'));
const ProfilePage    = lazy(() => import('./components/student/ProfilePage'));
const SettingsPage   = lazy(() => import('./components/student/SettingsPage'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AnalyticsPage  = lazy(() => import('./components/admin/AnalyticsPage'));
const MenuMgmt       = lazy(() => import('./components/admin/MenuManagementPage'));
const ReportsPage    = lazy(() => import('./components/admin/ReportsPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const PAGE_TRANSITIONS = {
  initial:  { opacity: 0, y: 8 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -4 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

function AppContent() {
  const { state, navigate } = useApp();
  const { user, activePage } = state;
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('search');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  if (!user) return <LoginPage />;

  const isAdmin = user.role === 'admin';

  function renderPage() {
    switch (activePage) {
      case 'home':          return <HomePage />;
      case 'search':        return <SearchPage />;
      case 'cart':          return <CartPage />;
      case 'orders':        return <OrdersPage />;
      case 'order-detail':  return <OrderDetail />;
      case 'profile':       return <ProfilePage />;
      case 'settings':      return <SettingsPage />;
      case 'admin':         return <AdminDashboard />;
      case 'menu-mgmt':     return <MenuMgmt />;
      case 'analytics':     return <AnalyticsPage />;
      case 'reports':       return <ReportsPage />;
      default:              return isAdmin ? <AdminDashboard /> : <HomePage />;
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300">
      <Navbar onSearch={() => navigate('search')} />
      <Sidebar />

      <main>
        <AnimatePresence mode="wait">
          <motion.div key={activePage} {...PAGE_TRANSITIONS}>
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAdmin && <BottomNav />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
