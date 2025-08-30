import { createClient } from "@supabase/supabase-js";
import { Database } from "../../server/lib/database.types";

// Environment-aware configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase Simple - URL:", supabaseUrl ? "Set" : "Not set");
console.log("Supabase Simple - Key:", supabaseAnonKey ? "Set" : "Not set");

// Create Supabase client only if we have valid credentials
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

// Simple user context helper that always returns demo data
export const getUserContext = async (userId: string) => {
  console.log("getUserContext (Simple): Starting with userId:", userId);

  // Always return demo data to avoid database timeouts
  const demoTenantId = "00000000-0000-0000-0000-000000000001";
  const demoData = {
    user: {
      id: userId,
      auth_user_id: userId,
      name: "Demo User",
      email: "demo@example.com",
      role: "user" as const,
      tenant_id: demoTenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avatar_url: null,
    },
    tenant: {
      id: demoTenantId,
      name: "Demo Organization",
      domain: "demo.local",
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  console.log("getUserContext (Simple): Returning demo data");
  return { data: demoData, error: null };
};

// Basic auth functions that work with demo mode
export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    // Demo mode - simulate successful login
    return {
      data: {
        user: {
          id: "demo-user-id",
          email,
          user_metadata: { name: email.split("@")[0] },
        },
        session: { access_token: "demo-token" },
      },
      error: null,
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string) => {
  if (!supabase) {
    // Demo mode - simulate successful signup
    return {
      data: {
        user: {
          id: "demo-user-id",
          email,
          user_metadata: { name: email.split("@")[0] },
        },
        session: { access_token: "demo-token" },
      },
      error: null,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    // Demo mode - simulate successful signout
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  if (!supabase) {
    // Demo mode - simulate successful password reset
    return { data: {}, error: null };
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};
