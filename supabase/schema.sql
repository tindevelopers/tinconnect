-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'guest');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'active', 'ended', 'cancelled');
CREATE TYPE participant_role AS ENUM ('host', 'attendee');

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    settings JSONB NOT NULL DEFAULT '{
        "maxParticipants": 50,
        "recordingEnabled": true,
        "chatEnabled": true,
        "screenShareEnabled": true
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Create meetings table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{
        "recordingEnabled": true,
        "chatEnabled": true,
        "screenShareEnabled": true,
        "waitingRoomEnabled": false
    }',
    status meeting_status NOT NULL DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    chime_meeting_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meeting participants table
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role participant_role NOT NULL DEFAULT 'attendee',
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    is_present BOOLEAN NOT NULL DEFAULT false,
    chime_attendee_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

-- Create chat messages table (for future use)
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_meetings_tenant_id ON meetings(tenant_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX idx_chat_messages_meeting_id ON chat_messages(meeting_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_participants_updated_at BEFORE UPDATE ON meeting_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'::user_role
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- More permissive RLS Policies for tenants table
CREATE POLICY "Tenants are viewable by authenticated users" ON tenants
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Tenants can be created by authenticated users" ON tenants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Tenants can be updated by admins in the same tenant" ON tenants
    FOR UPDATE USING (id = get_user_tenant_id() AND is_user_admin());

CREATE POLICY "Tenants can be deleted by admins in the same tenant" ON tenants
    FOR DELETE USING (id = get_user_tenant_id() AND is_user_admin());

-- More permissive RLS Policies for users table
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

-- RLS Policies for meetings table
CREATE POLICY "Meetings are viewable by users in the same tenant" ON meetings
    FOR SELECT USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Meetings can be created by users in the same tenant" ON meetings
    FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Meetings can be updated by host or admins in the same tenant" ON meetings
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND 
        (host_id = auth.uid() OR is_user_admin())
    );

CREATE POLICY "Meetings can be deleted by host or admins in the same tenant" ON meetings
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND 
        (host_id = auth.uid() OR is_user_admin())
    );

-- RLS Policies for meeting_participants table
CREATE POLICY "Meeting participants are viewable by users in the same tenant" ON meeting_participants
    FOR SELECT USING (
        meeting_id IN (
            SELECT id FROM meetings WHERE tenant_id = get_user_tenant_id()
        )
    );

CREATE POLICY "Meeting participants can be created by users in the same tenant" ON meeting_participants
    FOR INSERT WITH CHECK (
        meeting_id IN (
            SELECT id FROM meetings WHERE tenant_id = get_user_tenant_id()
        )
    );

CREATE POLICY "Meeting participants can be updated by users in the same tenant" ON meeting_participants
    FOR UPDATE USING (
        meeting_id IN (
            SELECT id FROM meetings WHERE tenant_id = get_user_tenant_id()
        )
    );

CREATE POLICY "Meeting participants can be deleted by users in the same tenant" ON meeting_participants
    FOR DELETE USING (
        meeting_id IN (
            SELECT id FROM meetings WHERE tenant_id = get_user_tenant_id()
        )
    );

-- RLS Policies for chat_messages table
CREATE POLICY "Chat messages are viewable by users in the same tenant" ON chat_messages
    FOR SELECT USING (
        meeting_id IN (
            SELECT id FROM meetings WHERE tenant_id = get_user_tenant_id()
        )
    );

CREATE POLICY "Chat messages can be created by users in the same tenant" ON chat_messages
    FOR INSERT WITH CHECK (
        meeting_id IN (
            SELECT id FROM meetings WHERE tenant_id = get_user_tenant_id()
        )
    );

-- Create views for easier querying
CREATE VIEW tenant_meetings AS
SELECT 
    m.*,
    t.name as tenant_name,
    t.domain as tenant_domain,
    u.name as host_name,
    u.email as host_email,
    COUNT(mp.id) as participant_count
FROM meetings m
JOIN tenants t ON m.tenant_id = t.id
JOIN users u ON m.host_id = u.id
LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
GROUP BY m.id, t.name, t.domain, u.name, u.email;

-- Create function to get user's meetings
CREATE OR REPLACE FUNCTION get_user_meetings(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
    meeting_id UUID,
    title VARCHAR(255),
    description TEXT,
    status meeting_status,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    is_host BOOLEAN,
    participant_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.description,
        m.status,
        m.scheduled_at,
        m.started_at,
        m.ended_at,
        (m.host_id = user_uuid) as is_host,
        COUNT(mp.id) as participant_count
    FROM meetings m
    LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
    WHERE m.tenant_id = get_user_tenant_id()
    GROUP BY m.id, m.host_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
