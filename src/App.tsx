import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthService } from './services/authService';
import { User } from './types';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Pages
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UsersPage from './pages/UsersPage';

// AppContent component that uses router hooks
function AppContent({ user, onLogout }: { user: User; onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Determine active menu item based on current route
  const getActiveMenuItem = (pathname: string) => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname === '/products') return 'items';
    if (pathname === '/transactions') return 'transactions';
    if (pathname === '/inventory') return 'inventory';
    if (pathname === '/reports') return 'reports';
    if (pathname === '/users') return 'users';
    if (pathname === '/settings') return 'settings';
    return 'dashboard';
  };

  const activeMenuItem = getActiveMenuItem(location.pathname);

  const handleMenuClick = (menuId: string) => {
    // Close mobile sidebar when menu item is clicked
    setSidebarOpen(false);
    
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
      case 'users':
        navigate('/users');
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
      <Header onLogout={onLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar 
        activeItem={activeMenuItem} 
        onItemClick={handleMenuClick}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area */}
      <main className="lg:ml-64 pt-16 lg:pt-20 transition-all duration-300">
        <div className="p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

// Main App component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {user ? (
        <AppContent user={user} onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route 
            path="/login" 
            element={<LoginPage onLogin={setUser} />} 
          />
          <Route 
            path="/signup" 
            element={<SignupPage onSignup={setUser} />} 
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;