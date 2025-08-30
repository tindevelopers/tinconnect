-- Quick RLS Diagnostic Script
-- Run this in Supabase SQL Editor to check current state

-- 1. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'users', 'meetings', 'meeting_participants', 'chat_messages');

-- 2. List all current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'users', 'meetings', 'meeting_participants', 'chat_messages')
ORDER BY tablename, policyname;

-- 3. Check if default tenant exists
SELECT 
    'Default tenant check' as check_type,
    EXISTS(SELECT 1 FROM tenants WHERE id = '00000000-0000-0000-0000-000000000000') as default_tenant_exists,
    COUNT(*) as total_tenants
FROM tenants;

-- 4. Check if any users exist
SELECT 
    'Users check' as check_type,
    COUNT(*) as total_users,
    COUNT(DISTINCT tenant_id) as unique_tenants
FROM users;

-- 5. Test basic permissions (this will show if RLS is blocking access)
SELECT 
    'Permission test' as test_type,
    auth.uid() as current_user_id,
    (SELECT COUNT(*) FROM tenants) as tenants_count,
    (SELECT COUNT(*) FROM users) as users_count;
