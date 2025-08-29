import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, getUserContext, signIn as signInHelper, signUp as signUpHelper, signOut as signOutHelper, resetPassword as resetPasswordHelper } from '../lib/supabase';
import { Tenant, User as UserProfile } from '../../server/lib/database.types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  tenant: Tenant | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { name: string; tenant_id: string }) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserContext(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserContext(session.user.id);
        } else {
          setUserProfile(null);
          setTenant(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserContext = async (userId: string) => {
    try {
      const { data, error } = await getUserContext(userId);
      if (error) {
        console.error('Error loading user context:', error);
        return;
      }
      
      if (data) {
        setUserProfile(data);
        setTenant(data.tenants as Tenant);
      }
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    return await signInHelper(email, password);
  };

  const signUp = async (email: string, password: string, userData: { name: string; tenant_id: string }) => {
    return await signUpHelper(email, password, userData);
  };

  const signOut = async () => {
    return await signOutHelper();
  };

  const resetPassword = async (email: string) => {
    return await resetPasswordHelper(email);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    tenant,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
