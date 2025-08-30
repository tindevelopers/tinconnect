-- Fix RLS Policies for TIN Connect
-- This script will diagnose and fix the Row Level Security issues

-- 1. First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'users', 'meetings', 'meeting_participants', 'chat_messages')
ORDER BY tablename, policyname;

-- 2. Drop all existing restrictive policies
DROP POLICY IF EXISTS "Tenants are viewable by users in the same tenant" ON tenants;
DROP POLICY IF EXISTS "Users are viewable by users in the same tenant" ON users;
DROP POLICY IF EXISTS "Users can be created by admins in the same tenant" ON users;
DROP POLICY IF EXISTS "Users can be updated by admins in the same tenant" ON users;
DROP POLICY IF EXISTS "Users can be deleted by admins in the same tenant" ON users;

-- 3. Create more permissive policies for development
-- Tenants table policies
CREATE POLICY "Tenants are viewable by authenticated users" ON tenants
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Tenants can be created by authenticated users" ON tenants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Tenants can be updated by admins in the same tenant" ON tenants
    FOR UPDATE USING (id = get_user_tenant_id() AND is_user_admin());

CREATE POLICY "Tenants can be deleted by admins in the same tenant" ON tenants
    FOR DELETE USING (id = get_user_tenant_id() AND is_user_admin());

-- Users table policies
CREATE POLICY "Users can view their own record" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view users in the same tenant" ON users
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can create their own record" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can be created by admins in the same tenant" ON users
    FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id() AND is_user_admin());

CREATE POLICY "Users can update their own record" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can be updated by admins in the same tenant" ON users
    FOR UPDATE USING (tenant_id = get_user_tenant_id() AND is_user_admin());

CREATE POLICY "Users can be deleted by admins in the same tenant" ON users
    FOR DELETE USING (tenant_id = get_user_tenant_id() AND is_user_admin());

-- 4. Create a default tenant if it doesn't exist
INSERT INTO tenants (id, name, domain, settings)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Default Organization',
    'default.local',
    '{
        "maxParticipants": 50,
        "recordingEnabled": true,
        "chatEnabled": true,
        "screenShareEnabled": true
    }'
) ON CONFLICT (id) DO NOTHING;

-- 5. Check if the current user exists in the users table
-- This will help us understand if the user record creation is working
SELECT 
    'Current user check' as check_type,
    auth.uid() as current_user_id,
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid()) as user_exists,
    (SELECT tenant_id FROM users WHERE id = auth.uid()) as user_tenant_id;

-- 6. Show the final policy list
SELECT 'Final policies:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'users', 'meetings', 'meeting_participants', 'chat_messages')
ORDER BY tablename, policyname;
