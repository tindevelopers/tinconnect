import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Only check for environment variables at runtime, not during build
const checkEnvVars = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
};

// Create Supabase client with service role key for server-side operations
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create Supabase client for user operations (with user context)
export const createUserClient = (accessToken: string) => {
  checkEnvVars();
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

// Helper function to get user from JWT token
export const getUserFromToken = async (accessToken: string) => {
  checkEnvVars();
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// Helper function to get user's tenant context
export const getUserTenantContext = async (userId: string) => {
  checkEnvVars();
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        tenant_id,
        tenants (
          id,
          name,
          domain,
          settings
        )
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user tenant context:', error);
    return null;
  }
};
