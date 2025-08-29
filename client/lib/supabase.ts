import { createClient } from '@supabase/supabase-js';
import { Database } from '../../server/lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only check for environment variables at runtime, not during build
const checkEnvVars = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  }
};

// Create Supabase client for frontend
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Auth helper functions
export const signUp = async (email: string, password: string, userData: {
  name: string;
  tenant_id: string;
}) => {
  checkEnvVars();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  checkEnvVars();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  checkEnvVars();
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  checkEnvVars();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

export const updatePassword = async (password: string) => {
  checkEnvVars();
  const { data, error } = await supabase.auth.updateUser({
    password
  });
  return { data, error };
};

// User context helper
export const getUserContext = async (userId: string) => {
  checkEnvVars();
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      tenants (
        id,
        name,
        domain,
        settings
      )
    `)
    .eq('id', userId)
    .single();

  return { data, error };
};

// Real-time subscriptions
export const subscribeToMeetingUpdates = (meetingId: string, callback: (payload: any) => void) => {
  checkEnvVars();
  return supabase
    .channel(`meeting:${meetingId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'meeting_participants',
        filter: `meeting_id=eq.${meetingId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToParticipantUpdates = (meetingId: string, callback: (payload: any) => void) => {
  checkEnvVars();
  return supabase
    .channel(`participants:${meetingId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'meeting_participants',
        filter: `meeting_id=eq.${meetingId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToChatMessages = (meetingId: string, callback: (payload: any) => void) => {
  checkEnvVars();
  return supabase
    .channel(`chat:${meetingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `meeting_id=eq.${meetingId}`
      },
      callback
    )
    .subscribe();
};
