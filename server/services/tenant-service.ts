import { supabase } from '../lib/supabase.js';
import { 
  Tenant, 
  TenantInsert, 
  TenantUpdate,
  User, 
  UserInsert, 
  UserUpdate,
  UserRole 
} from '../lib/database.types.js';
import { CreateTenantRequest, CreateUserRequest } from '@shared/api';

export class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(request: CreateTenantRequest): Promise<Tenant> {
    try {
      const tenantData: TenantInsert = {
        name: request.name,
        domain: request.domain,
        settings: {
          maxParticipants: request.settings?.maxParticipants || 50,
          recordingEnabled: request.settings?.recordingEnabled ?? true,
          chatEnabled: request.settings?.chatEnabled ?? true,
          screenShareEnabled: request.settings?.screenShareEnabled ?? true,
        },
      };

      const { data: tenant, error } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select()
        .single();

      if (error) {
        console.error('Error creating tenant:', error);
        throw new Error('Failed to create tenant');
      }

      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new Error('Failed to create tenant');
    }
  }

  /**
   * Get a tenant by ID
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting tenant:', error);
        throw new Error('Failed to get tenant');
      }

      return tenant;
    } catch (error) {
      console.error('Error getting tenant:', error);
      throw new Error('Failed to get tenant');
    }
  }

  /**
   * Get a tenant by domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    try {
      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('domain', domain)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting tenant by domain:', error);
        throw new Error('Failed to get tenant by domain');
      }

      return tenant;
    } catch (error) {
      console.error('Error getting tenant by domain:', error);
      throw new Error('Failed to get tenant by domain');
    }
  }

  /**
   * Update a tenant
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    try {
      // Remove immutable fields
      const { id, created_at, ...updateData } = updates;

      const { data: tenant, error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating tenant:', error);
        throw new Error('Failed to update tenant');
      }

      return tenant;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw new Error('Failed to update tenant');
    }
  }

  /**
   * Delete a tenant
   */
  async deleteTenant(tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) {
        console.error('Error deleting tenant:', error);
        throw new Error('Failed to delete tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw new Error('Failed to delete tenant');
    }
  }

  /**
   * Create a new user in a tenant
   */
  async createUser(request: CreateUserRequest): Promise<User> {
    try {
      // First, create the user in Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: this.generateTemporaryPassword(), // User will reset this
        email_confirm: true,
        user_metadata: {
          name: request.name,
          tenant_id: request.tenantId,
        },
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw new Error('Failed to create user');
      }

      // Then create the user profile in our users table
      const userData: UserInsert = {
        id: authUser.user.id,
        tenant_id: request.tenantId,
        email: request.email,
        name: request.name,
        role: request.role || 'user',
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authUser.user.id);
        console.error('Error creating user profile:', error);
        throw new Error('Failed to create user profile');
      }

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Get a user by ID within a tenant
   */
  async getUser(tenantId: string, userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting user:', error);
        throw new Error('Failed to get user');
      }

      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Get a user by email within a tenant
   */
  async getUserByEmail(tenantId: string, email: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting user by email:', error);
        throw new Error('Failed to get user by email');
      }

      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user by email');
    }
  }

  /**
   * Get all users in a tenant
   */
  async getTenantUsers(tenantId: string): Promise<User[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting tenant users:', error);
        throw new Error('Failed to get tenant users');
      }

      return users || [];
    } catch (error) {
      console.error('Error getting tenant users:', error);
      throw new Error('Failed to get tenant users');
    }
  }

  /**
   * Update a user
   */
  async updateUser(tenantId: string, userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Remove immutable fields
      const { id, tenant_id, created_at, ...updateData } = updates;

      const { data: user, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
      }

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(tenantId: string, userId: string): Promise<void> {
    try {
      // Delete from our users table (this will cascade to auth.users)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('Error deleting user:', error);
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Get user with tenant context (for authenticated requests)
   */
  async getUserWithTenantContext(userId: string): Promise<{
    user: User;
    tenant: Tenant;
  } | null> {
    try {
      const { data: userWithTenant, error } = await supabase
        .from('users')
        .select(`
          *,
          tenants (
            id,
            name,
            domain,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error getting user with tenant context:', error);
        throw new Error('Failed to get user with tenant context');
      }

      return {
        user: userWithTenant,
        tenant: userWithTenant.tenants as Tenant,
      };
    } catch (error) {
      console.error('Error getting user with tenant context:', error);
      throw new Error('Failed to get user with tenant context');
    }
  }

  /**
   * Check if user is admin in their tenant
   */
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking user admin status:', error);
        return false;
      }

      return user.role === 'admin';
    } catch (error) {
      console.error('Error checking user admin status:', error);
      return false;
    }
  }

  /**
   * Generate a temporary password for new users
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Get tenant statistics
   */
  async getTenantStats(tenantId: string): Promise<{
    totalUsers: number;
    totalMeetings: number;
    activeMeetings: number;
  }> {
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get meeting counts
      const { count: totalMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      const { count: activeMeetings } = await supabase
        .from('meetings')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      return {
        totalUsers: userCount || 0,
        totalMeetings: totalMeetings || 0,
        activeMeetings: activeMeetings || 0,
      };
    } catch (error) {
      console.error('Error getting tenant stats:', error);
      throw new Error('Failed to get tenant statistics');
    }
  }
}
