import { createContext, useContext, useEffect, useState } from 'react';
import {
  authenticateUser,
  createUser,
  getSession,
  setSession,
  type Profile,
} from '../lib/mockData';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
    law_enforcement_affiliated: string;
    date_of_birth: string;
    deposit_amount: number;
    duration: number;
    service_type: string;
    personal_items: string;
    profile_picture?: string | null;
  }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = getSession();
    if (session) {
      setProfile(session);
    }
    setLoading(false);
  }, []);

  const signUp = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    gender: string;
    law_enforcement_affiliated: string;
    date_of_birth: string;
    deposit_amount: number;
    duration: number;
    service_type: string;
    personal_items: string;
    profile_picture?: string | null;
  }) => {
    try {
      const newProfile = createUser(userData);
      setProfile(newProfile);
      setSession(newProfile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userProfile = authenticateUser(email, password);
      if (userProfile) {
        setProfile(userProfile);
        setSession(userProfile);
        return { error: null };
      } else {
        return { error: new Error('Invalid email or password') };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setProfile(null);
    setSession(null);
  };

  const user = profile ? { id: profile.id, email: profile.email } : null;
  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
