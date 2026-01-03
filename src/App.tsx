import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { UserDashboard } from './components/UserDashboard';
import { TransactionsPage } from './components/TransactionsPage';
import { ProfilePage } from './components/ProfilePage';
import { HelpPage } from './components/HelpPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function UserRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <ProtectedRoute>
      <UserRoutes />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
