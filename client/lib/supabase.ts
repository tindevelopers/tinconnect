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

// Session persistence utilities
export const getStoredSession = () => {
  try {
    const sessionKey = `sb-${supabaseAnonKey}-auth-token`;
    const stored = localStorage.getItem(sessionKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.currentSession || null;
    }
  } catch (error) {
    console.warn('Error reading stored session:', error);
  }
  return null;
};

export const clearStoredSession = () => {
  try {
    const sessionKey = `sb-${supabaseAnonKey}-auth-token`;
    localStorage.removeItem(sessionKey);
  } catch (error) {
    console.warn('Error clearing stored session:', error);
  }
};

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

    // If signup is successful, create the user record in the users table
    if (data.user && !error) {
      try {
        // Check if user already exists before inserting
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!existingUser) {
          // Only insert if user doesn't exist
          const { error: userError } = await supabase
            .from("users")
            .insert({
              id: data.user.id,
              tenant_id: userData.tenant_id,
              email: email,
              name: userData.name,
              role: "user"
            });

          if (userError) {
            console.error("Error creating user record:", userError);
            // Don't fail the signup, just log the error
          }
        } else {
          console.log("User record already exists, skipping creation");
        }
      } catch (userError) {
        console.error("Error creating user record:", userError);
        // Don't fail the signup, just log the error
      }
    }

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
    console.log("signOut: Starting sign out process...");
    
    // Clear any stored session data
    clearStoredSession();
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("signOut: Supabase sign out error:", error);
      return { error };
    }
    
    console.log("signOut: Successfully signed out");
    return { error: null };
  } catch (error) {
    console.error("signOut: Unexpected error:", error);
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
  console.log("getUserContext: Starting with userId:", userId);
  if (!checkEnvVars()) {
    console.log("getUserContext: Environment variables check failed");
    return { data: null, error: { message: "Supabase not configured" } };
  }

  try {
    console.log("getUserContext: Attempting to fetch user from users table...");
    // First, try to get the user from the users table with timeout
    const queryPromise = supabase
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
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 30000); // 30 second timeout
    });

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    console.log("getUserContext: Query completed with:", { data, error });

    // If user doesn't exist in users table, create them
    if (error && error.code === 'PGRST116') {
      console.log("getUserContext: User not found in users table, attempting to create user record...");
      
      // Get the current user from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Create a default tenant first (if needed)
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .select("id")
          .limit(1)
          .single();

        let tenantId = "00000000-0000-0000-0000-000000000000"; // Default tenant ID
        
        if (tenantError && tenantError.code === 'PGRST116') {
          // No tenants exist, create a default one
          const { data: newTenant, error: createTenantError } = await supabase
            .from("tenants")
            .insert({
              name: "Default Organization",
              domain: "default.local",
              settings: {
                maxParticipants: 50,
                recordingEnabled: true,
                chatEnabled: true,
                screenShareEnabled: true
              }
            })
            .select("id")
            .single();

          if (createTenantError) {
            console.error("Error creating default tenant:", createTenantError);
            return { data: null, error: createTenantError };
          }
          
          tenantId = newTenant.id;
        } else if (tenantData) {
          tenantId = tenantData.id;
        }

        // Check if user already exists before inserting
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();
        
        if (existingUser) {
          console.log("getUserContext: User already exists, fetching complete record...");
          // User exists, fetch the complete record
          const { data: completeUser, error: fetchError } = await supabase
            .from("users")
            .select(`
              *,
              tenants (
                id,
                name,
                domain,
                settings
              )
            `)
            .eq("id", user.id)
            .single();
          
          if (fetchError) {
            console.error("Error fetching existing user:", fetchError);
            return { data: null, error: fetchError };
          }
          
          return { data: completeUser, error: null };
        }
        
        // Create user record only if it doesn't exist
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            tenant_id: tenantId,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split('@')[0] || "User",
            role: "user"
          })
          .select(
            `
            *,
            tenants (
              id,
              name,
              domain,
              settings
            )
          `
          )
          .single();

        if (createUserError) {
          console.error("Error creating user record:", createUserError);
          return { data: null, error: createUserError };
        }

        console.log("User record created successfully:", newUser);
        return { data: newUser, error: null };
      }
    }

    if (error) {
      console.error("getUserContext: Error getting user context:", error);
      
      // If it's a timeout or connection error, try to create a basic user context
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        console.log("getUserContext: Database timeout/error, creating fallback user context...");
        return {
          data: {
            id: userId,
            email: "user@example.com",
            name: "User",
            role: "user",
            tenant_id: "00000000-0000-0000-0000-000000000000",
            tenants: {
              id: "00000000-0000-0000-0000-000000000000",
              name: "Default Organization",
              domain: "default.local",
              settings: {
                maxParticipants: 50,
                recordingEnabled: true,
                chatEnabled: true,
                screenShareEnabled: true
              }
            }
          },
          error: null
        };
      }
      
      // For any other error, also provide fallback
      console.log("getUserContext: Other error, providing fallback user context...");
      return {
        data: {
          id: userId,
          email: "user@example.com",
          name: "User",
          role: "user",
          tenant_id: "00000000-0000-0000-0000-000000000000",
          tenants: {
            id: "00000000-0000-0000-0000-000000000000",
            name: "Default Organization",
            domain: "default.local",
            settings: {
              maxParticipants: 50,
              recordingEnabled: true,
              chatEnabled: true,
              screenShareEnabled: true
            }
          }
        },
        error: null
      };
      
      return { data: null, error };
    }

    console.log("getUserContext: Successfully retrieved user data:", data);
    return { data, error: null };
  } catch (error) {
    console.error("getUserContext: Unexpected error:", error);
    return { data: null, error: { message: "Failed to get user context" } };
  }
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
