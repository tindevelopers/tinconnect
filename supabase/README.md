# Supabase Setup Guide for TIN Connect

This guide will help you set up Supabase for the TIN Connect multi-tenant video platform.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `tinconnect`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users

### 2. Get Project Credentials

After project creation, go to **Settings > API** and copy:
- **Project URL** (SUPABASE_URL)
- **Anon Key** (SUPABASE_ANON_KEY)
- **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

### 3. Run Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `schema.sql`
3. Click "Run" to execute the schema

### 4. Configure Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Keep existing AWS Chime configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## 🏗 Database Schema Overview

### Tables Created:

#### **tenants**
- Multi-tenant organization data
- Custom settings per tenant
- Domain-based tenant identification

#### **users**
- Extends Supabase auth.users
- Tenant-scoped user management
- Role-based access control

#### **meetings**
- Video meeting metadata
- Tenant and host relationships
- Meeting status tracking

#### **meeting_participants**
- Participant tracking per meeting
- Real-time presence updates
- Chime SDK integration

#### **chat_messages**
- Meeting chat functionality
- Real-time messaging support

### Row Level Security (RLS) Policies:

- **Tenant Isolation**: Users can only access data from their tenant
- **Role-Based Access**: Admins have additional permissions
- **Meeting Access**: Users can only access meetings in their tenant
- **Host Controls**: Meeting hosts can manage their meetings

### Database Functions:

- **get_user_tenant_id()**: Get current user's tenant context
- **is_user_admin()**: Check if user has admin role
- **get_user_meetings()**: Get user's meetings with metadata

## 🔐 Authentication Setup

### 1. Configure Auth Settings

Go to **Authentication > Settings** and configure:

#### **Site URL**
```
http://localhost:8080
```

#### **Redirect URLs**
```
http://localhost:8080/dashboard
http://localhost:8080/auth/callback
```

### 2. Email Templates (Optional)

Customize email templates in **Authentication > Email Templates**:
- Confirm signup
- Magic link
- Change email address
- Reset password

### 3. Social Providers (Optional)

Configure social login providers in **Authentication > Providers**:
- Google
- GitHub
- Microsoft

## 📊 Database Views

### **tenant_meetings**
Combined view of meetings with tenant and host information:
- Meeting details
- Tenant context
- Host information
- Participant count

## 🔄 Real-time Features

### Enable Real-time for Tables:

1. Go to **Database > Replication**
2. Enable real-time for:
   - `meeting_participants`
   - `chat_messages`
   - `meetings`

### Real-time Channels:

- **meeting_updates**: Meeting status changes
- **participant_updates**: Participant join/leave events
- **chat_messages**: Real-time chat

## 🛡 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with tenant-specific policies:

- **Automatic tenant isolation**
- **Role-based access control**
- **Meeting host permissions**

### Custom Claims
Users get tenant context via custom claims:
- `tenant_id`: User's tenant
- `role`: User's role in tenant
- `permissions`: Role-based permissions

## 📈 Performance Optimization

### Indexes Created:
- `idx_users_tenant_id`: Fast tenant user queries
- `idx_meetings_tenant_id`: Fast tenant meeting queries
- `idx_meeting_participants_meeting_id`: Fast participant queries

### Query Optimization:
- Use `get_user_meetings()` function for optimized queries
- Leverage database views for complex queries
- Use RLS for automatic data filtering

## 🔧 Development Workflow

### 1. Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### 2. Database Changes
1. Modify `schema.sql`
2. Run in Supabase SQL Editor
3. Update TypeScript types if needed

### 3. Testing
- Use Supabase dashboard for data inspection
- Test RLS policies with different user roles
- Verify real-time subscriptions

## 🚀 Production Deployment

### 1. Environment Variables
Set production environment variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Domain Configuration
Update redirect URLs for production domain:
```
https://yourdomain.com/dashboard
https://yourdomain.com/auth/callback
```

### 3. Monitoring
- Use Supabase dashboard for monitoring
- Set up alerts for database performance
- Monitor real-time connection usage

## 🔍 Troubleshooting

### Common Issues:

#### **RLS Policy Errors**
- Check user authentication status
- Verify tenant context
- Review policy conditions

#### **Real-time Not Working**
- Enable real-time for tables
- Check subscription setup
- Verify channel names

#### **TypeScript Errors**
- Regenerate types if schema changes
- Check import paths
- Verify type definitions

### Support Resources:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 📚 Next Steps

After setting up the schema:

1. **Migrate Services**: Update backend services to use Supabase
2. **Update Frontend**: Integrate Supabase Auth and client
3. **Test Multi-tenant**: Verify tenant isolation works
4. **Add Real-time**: Implement real-time meeting updates
5. **Deploy**: Deploy to production environment

The schema is now ready for the TIN Connect multi-tenant video platform! 🎉
