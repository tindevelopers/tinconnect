-- Temporary RLS Disable for Development
-- WARNING: This disables RLS for development only. DO NOT use in production!

-- Disable RLS on all tables temporarily
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Create default tenant if it doesn't exist
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

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'users', 'meetings', 'meeting_participants', 'chat_messages');

-- Test access
SELECT 'RLS disabled - testing access' as status;
SELECT COUNT(*) as tenants_count FROM tenants;
SELECT COUNT(*) as users_count FROM users;
