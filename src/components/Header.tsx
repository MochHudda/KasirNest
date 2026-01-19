import { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { Button } from './ui/Button';

interface HeaderProps {
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export function Header({ onLogout, onToggleSidebar }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowUserMenu(false);
  };
  return (
    <header className="h-16 lg:h-20 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-20">
      <div className="h-full flex items-center justify-between px-4 lg:px-8">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={onToggleSidebar}
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </Button>
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg lg:text-xl font-bold">A</span>
            </div>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900 hidden sm:block">ApparelPos</h1>
          </div>
        </div>

        {/* Search Bar - Hidden on very small screens, but add mobile search button */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clothing, accessories..."
              className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>
        </div>

        {/* Mobile Search Button */}
        <Button variant="ghost" size="sm" className="md:hidden p-2">
          <Search className="w-5 h-5 text-gray-600" />
        </Button>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          <Button variant="ghost" size="sm" className="relative p-2 hidden sm:flex">
            <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-r-lg p-1 lg:p-2 transition-colors"
            >
              <div className="text-right hidden lg:block">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser.username || 'Admin User'}
                </div>
                <div className="text-xs text-gray-500">Super Admin</div>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {currentUser.username || 'Admin User'}
                  </div>
                  <div className="text-xs text-gray-500">Super Admin</div>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}