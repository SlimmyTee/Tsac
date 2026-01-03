import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Clock, User, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserLayoutProps {
  children: ReactNode;
  currentPage: 'home' | 'transactions' | 'profile' | 'help';
}

export function UserLayout({ children, currentPage }: UserLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home, path: '/dashboard' },
    { id: 'transactions', label: 'TRANSACTIONS', icon: Clock, path: '/transactions' },
    { id: 'profile', label: 'PROFILE', icon: User, path: '/profile' },
    { id: 'help', label: 'HELP AND SUPPORT', icon: Bell, path: '/help' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            ProFinance
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto text-white">→</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">LOG OUT</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Hi {profile?.first_name || profile?.full_name || 'User'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-medium">
              {profile?.first_name?.toUpperCase() || profile?.full_name?.toUpperCase() || 'USER'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-900 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

