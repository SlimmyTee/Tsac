import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Clock, User, Bell, LogOut, Menu, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserLayoutProps {
  children: ReactNode;
  currentPage: 'home' | 'transactions' | 'profile' | 'help';
}

export function UserLayout({ children, currentPage }: UserLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'transactions', label: 'Transactions', icon: Clock, path: '/transactions' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'help', label: 'Help & Support', icon: Bell, path: '/help' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f1] flex relative overflow-hidden">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-xl transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                Therapeutic
              </h1>
            </div>
            <p className="text-xs text-slate-500 pl-12">Service Access Card</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm ring-1 ring-emerald-100'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full"></div>
                  )}
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Summary Bottom */}
          <div className="p-4 border-t border-slate-100 bg-white/30">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-white/60 shadow-sm mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                {profile?.first_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all duration-200 font-medium text-sm group"
            >
              <LogOut className="w-4 h-4 group-hover:stroke-2" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72 relative z-10 transition-all duration-300">
        {/* Header (Mobile Only primarily, or simplified Desktop) */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/50 px-6 py-4 flex items-center justify-between lg:hidden mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-800">
              {navItems.find(n => n.id === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
        </header>

        {/* Desktop Header area / Breadcrumbs if needed, simplified for now */}
        <div className="hidden lg:flex items-center justify-between px-8 py-6 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome back, {profile?.first_name || 'User'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Here is what's happening today</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white rounded-full text-slate-400 hover:text-emerald-500 hover:shadow-md transition-all border border-slate-100">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-700">{profile?.full_name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{profile?.role || 'Member'}</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 lg:px-8 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}
