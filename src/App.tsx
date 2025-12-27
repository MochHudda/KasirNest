import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Pages
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import TransactionsPage from './pages/TransactionsPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';

// AppContent component that uses router hooks
function AppContent({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active menu item based on current route
  const getActiveMenuItem = (pathname: string) => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/products') return 'items';
    if (pathname === '/transactions') return 'transactions';
    if (pathname === '/inventory') return 'inventory';
    if (pathname === '/reports') return 'reports';
    if (pathname === '/settings') return 'settings';
    return 'dashboard';
  };

  const activeMenuItem = getActiveMenuItem(location.pathname);

  const handleMenuClick = (menuId: string) => {
    switch (menuId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'items':
        navigate('/products');
        break;
      case 'transactions':
        navigate('/transactions');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={onLogout} />
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuClick} />
      
      {/* Main Content Area */}
      <main className="ml-64 pt-20 p-8">
        <div className="max-w-[1600px] mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authStatus === 'true');
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <p className="text-gray-600">Loading ApparelPos...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show main application if authenticated
  return (
    <Router>
      <AppContent onLogout={handleLogout} />
    </Router>
  );
}

export default App;