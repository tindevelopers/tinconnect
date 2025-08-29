# 🚀 TIN Connect - Multi-tenant Video Platform

A production-ready multi-tenant video conferencing platform built with React, TypeScript, Supabase, and AWS Chime SDK.

## ✨ Features

- **🔐 Multi-tenant Authentication** - Secure tenant isolation with Supabase Auth
- **📹 Video Conferencing** - Real-time video meetings with AWS Chime SDK
- **👥 User Management** - Role-based access control (Admin, User, Guest)
- **🏢 Tenant Management** - Complete organization management
- **💬 Real-time Chat** - Live messaging during meetings
- **📱 Responsive Design** - Modern UI that works on all devices
- **🔒 Row Level Security** - Automatic data isolation between tenants

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + Node.js
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Video**: AWS Chime SDK for Meetings
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (Full-stack)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- AWS account (for Chime SDK)

### 1. Clone the Repository
```bash
git clone https://github.com/tindevelopers/tinconnect.git
cd tinconnect
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy `env.example` to `.env` and configure:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS Configuration (for Chime SDK)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 4. Set Up Supabase
1. Create a new Supabase project
2. Run the schema from `supabase/schema.sql`
3. Configure authentication settings

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

## 🚀 Deploy to Vercel

This project is optimized for Vercel deployment:

1. **Connect to Vercel**: Import the GitHub repository
2. **Environment Variables**: Add your Supabase and AWS credentials
3. **Deploy**: Vercel will automatically build and deploy

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── components/         # UI components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and configurations
│   └── pages/             # Route components
├── server/                # Express backend
│   ├── lib/               # Server utilities
│   ├── routes/            # API routes
│   └── services/          # Business logic
├── shared/                # Shared types and utilities
├── supabase/              # Database schema and setup
└── dist/                  # Build output
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript checks
- `npm run test` - Run tests

## 🏗 Architecture

### Multi-tenant Design
- **Row Level Security (RLS)**: Automatic tenant data isolation
- **Tenant Context**: User sessions include tenant information
- **Scalable**: Support for unlimited tenants and users

### Authentication Flow
1. User signs up/in with Supabase Auth
2. User profile created with tenant context
3. RLS policies enforce tenant isolation
4. Protected routes require authentication

### Video Meeting Flow
1. Create meeting in tenant context
2. Generate Chime SDK meeting/attendee
3. Join meeting with real-time video
4. Automatic cleanup on meeting end

## 🔒 Security Features

- **Row Level Security**: Database-level tenant isolation
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin, User, Guest permissions
- **Environment Variables**: Secure credential management
- **CORS Protection**: API endpoint security

## 📈 Performance

- **Vite Build**: Fast development and optimized production builds
- **Code Splitting**: Automatic route-based code splitting
- **CDN Ready**: Static assets optimized for global delivery
- **Serverless**: API routes scale automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join the conversation on GitHub Discussions

---

**Built with ❤️ by TIN Developers**
