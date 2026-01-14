import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
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
    profile_picture?: File | null;
  }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

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
    profile_picture?: File | null;
  }) => {
    try {
      // 1. Sign Up User (Metadata without avatar_url first)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            gender: userData.gender,
            law_enforcement_affiliated: userData.law_enforcement_affiliated,
            date_of_birth: userData.date_of_birth,
            deposit_amount: userData.deposit_amount,
            duration: userData.duration,
            service_type: userData.service_type,
            personal_items: userData.personal_items,
            role: 'user',
            // avatar_url will be added after upload
          },
        },
      });

      if (signUpError) throw signUpError;

      // 2. If Session exists (Email confirmation disabled) and Image provided -> Upload
      if (data.session && userData.profile_picture) {
        const file = userData.profile_picture;
        const fileExt = file.name.split('.').pop();
        const fileName = `${data.session.user.id}/${Math.random()}.${fileExt}`;

        // Upload to 'avatars' bucket
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          // We don't throw here to avoid failing the whole sign up, 
          // but user won't have an avatar.
        } else {
          // 3. Get Public URL
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          // 4. Update User Metadata with Avatar URL
          if (publicUrlData.publicUrl) {
            const { error: updateError } = await supabase.auth.updateUser({
              data: { avatar_url: publicUrlData.publicUrl },
            });

            if (updateError) {
              console.error('Error updating profile with avatar:', updateError);
            } else {
              // Update local state is handled by onAuthStateChange, 
              // but we might want to ensure it's triggered or manually update if needed.
              // onAuthStateChange usually fires on updateUser.
            }
          }
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const user = session?.user ? { id: session.user.id, email: session.user.email || '' } : null;
  const isAdmin = profile?.role === 'admin';

  const value = {
    session,
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
