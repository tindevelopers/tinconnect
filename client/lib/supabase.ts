import { createClient } from "@supabase/supabase-js";
import { Database } from "../../server/lib/database.types";

// Environment-aware configuration
const isProduction = import.meta.env.PROD;
const isPreview = import.meta.env.VITE_VERCEL_ENV === "preview";
const isDevelopment = import.meta.env.DEV;

// Select environment variables based on deployment environment
const supabaseUrl = isProduction
  ? import.meta.env.VITE_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL_PREVIEW ||
    import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = isProduction
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY_PREVIEW ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log("=== Supabase Configuration Debug ===");
console.log("Environment:", isProduction ? "Production" : isPreview ? "Preview" : isDevelopment ? "Development" : "Unknown");
console.log("VITE_VERCEL_ENV:", import.meta.env.VITE_VERCEL_ENV);
console.log("PROD:", import.meta.env.PROD);
console.log("DEV:", import.meta.env.DEV);
console.log("Supabase URL:", supabaseUrl ? "Set" : "Not set");
console.log("Supabase Anon Key:", supabaseAnonKey ? "Set" : "Not set");
console.log("URL Preview:", import.meta.env.VITE_SUPABASE_URL_PREVIEW ? "Set" : "Not set");
console.log("Key Preview:", import.meta.env.VITE_SUPABASE_ANON_KEY_PREVIEW ? "Set" : "Not set");
console.log("URL Production:", import.meta.env.VITE_SUPABASE_URL ? "Set" : "Not set");
console.log("Key Production:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Set" : "Not set");
console.log("=====================================");

// Only check for environment variables at runtime, not during build
const checkEnvVars = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set",
    );
    console.error("Current values:", { supabaseUrl, supabaseAnonKey });
    return false;
  }
  return true;
};

// Create Supabase client for frontend
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  },
);

// Auth helper functions
export const signUp = async (
  email: string,
  password: string,
  userData: {
    name: string;
    tenant_id: string;
  },
) => {
  if (!checkEnvVars()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    return { data, error };
  } catch (error) {
    console.error("SignUp error:", error);
    return { data: null, error: { message: "Failed to sign up" } };
  }
};

export const signIn = async (email: string, password: string) => {
  if (!checkEnvVars()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    console.error("SignIn error:", error);
    return { data: null, error: { message: "Failed to sign in" } };
  }
};

export const signOut = async () => {
  if (!checkEnvVars()) {
    return { error: { message: "Supabase not configured" } };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("SignOut error:", error);
    return { error: { message: "Failed to sign out" } };
  }
};

export const resetPassword = async (email: string) => {
  if (!checkEnvVars()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  } catch (error) {
    console.error("ResetPassword error:", error);
    return { data: null, error: { message: "Failed to reset password" } };
  }
};

export const updatePassword = async (password: string) => {
  if (!checkEnvVars()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  return { data, error };
};

// User context helper
export const getUserContext = async (userId: string) => {
  if (!checkEnvVars()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      tenants (
        id,
        name,
        domain,
        settings
      )
    `,
    )
    .eq("id", userId)
    .single();

  return { data, error };
};

// Real-time subscriptions
export const subscribeToMeetingUpdates = (
  meetingId: string,
  callback: (payload: any) => void,
) => {
  if (!checkEnvVars()) {
    console.error("Supabase not configured for real-time subscriptions");
    return { unsubscribe: () => {} };
  }
  return supabase
    .channel(`meeting:${meetingId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "meeting_participants",
        filter: `meeting_id=eq.${meetingId}`,
      },
      callback,
    )
    .subscribe();
};

export const subscribeToParticipantUpdates = (
  meetingId: string,
  callback: (payload: any) => void,
) => {
  if (!checkEnvVars()) {
    console.error("Supabase not configured for real-time subscriptions");
    return { unsubscribe: () => {} };
  }
  return supabase
    .channel(`participants:${meetingId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "meeting_participants",
        filter: `meeting_id=eq.${meetingId}`,
      },
      callback,
    )
    .subscribe();
};

export const subscribeToChatMessages = (
  meetingId: string,
  callback: (payload: any) => void,
) => {
  if (!checkEnvVars()) {
    console.error("Supabase not configured for real-time subscriptions");
    return { unsubscribe: () => {} };
  }
  return supabase
    .channel(`chat:${meetingId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `meeting_id=eq.${meetingId}`,
      },
      callback,
    )
    .subscribe();
};
