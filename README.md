# TIN Connect - Multi-Tenant Video Platform

A production-ready multi-tenant video conferencing platform built with React, Express, and Amazon Chime SDK.

## 🚀 Features

### Multi-Tenant Architecture
- **Tenant Isolation**: Each organization has its own isolated environment
- **Custom Domains**: Support for custom subdomains per tenant
- **Tenant-Specific Settings**: Configurable meeting limits, features, and permissions
- **User Management**: Role-based access control (Admin, User, Guest)

### Video Conferencing
- **Real-time Video/Audio**: Powered by Amazon Chime SDK
- **Screen Sharing**: Built-in screen sharing capabilities
- **Chat**: Real-time messaging during meetings
- **Recording**: Meeting recording with tenant-level controls
- **Waiting Room**: Optional waiting room functionality
- **Participant Management**: Host controls for managing participants

### Meeting Management
- **Meeting Scheduling**: Create and schedule meetings
- **Meeting Dashboard**: Comprehensive meeting management interface
- **Meeting Status Tracking**: Real-time status updates
- **Participant Tracking**: Monitor who's in each meeting
- **Meeting Analytics**: Track meeting usage and statistics

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Amazon Chime SDK Component Library** for video functionality
- **TailwindCSS** for styling
- **Radix UI** for accessible components
- **React Router 6** for navigation

### Backend
- **Express.js** with TypeScript
- **Amazon Chime SDK** for video infrastructure
- **AWS DynamoDB** for data persistence
- **AWS SDK v3** for AWS services integration

### Infrastructure
- **Amazon Chime SDK** for real-time communication
- **AWS DynamoDB** for multi-tenant data storage
- **AWS SNS/SQS** for event handling (optional)

## 📋 Prerequisites

Before running this application, you'll need:

1. **AWS Account** with appropriate permissions
2. **Amazon Chime SDK** access
3. **Node.js** (v18 or higher)
4. **PNPM** package manager

## 🔧 Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tinconnect
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Configuration
DYNAMODB_TABLE_NAME=tinconnect-platform

# Amazon Chime SDK Configuration
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:chime-notifications
SQS_QUEUE_ARN=arn:aws:sqs:us-east-1:123456789012:chime-events

# Application Configuration
PING_MESSAGE=pong
NODE_ENV=development
```

### 4. AWS Setup

#### Create DynamoDB Table
```bash
aws dynamodb create-table \
  --table-name tinconnect-platform \
  --attribute-definitions \
      AttributeName=PK,AttributeType=S \
      AttributeName=SK,AttributeType=S \
      AttributeName=domain,AttributeType=S \
  --key-schema \
      AttributeName=PK,KeyType=HASH \
      AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
      IndexName=DomainIndex,KeySchema=[{AttributeName=domain,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST
```

#### IAM Permissions
Ensure your AWS credentials have the following permissions:
- `chime:*` - For Chime SDK operations
- `dynamodb:*` - For DynamoDB operations
- `sns:*` - For notifications (optional)
- `sqs:*` - For event handling (optional)

### 5. Development
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

## 🏗 Architecture

### Multi-Tenant Data Model

```
Tenant (PK: TENANT#{tenantId}, SK: TENANT#{tenantId})
├── Users (PK: TENANT#{tenantId}, SK: USER#{userId})
└── Meetings (PK: TENANT#{tenantId}, SK: MEETING#{meetingId})
```

### Key Components

#### Backend Services
- **TenantService**: Manages tenant creation, updates, and user management
- **MeetingService**: Handles meeting lifecycle and participant tracking
- **ChimeService**: Interfaces with Amazon Chime SDK for video functionality

#### Frontend Components
- **Dashboard**: Main application interface with tenant and meeting management
- **VideoMeeting**: Real-time video conferencing interface
- **MeetingDashboard**: Meeting creation and management interface

## 📱 Usage

### Creating a Tenant
1. Navigate to the Dashboard
2. Click "New Tenant"
3. Enter tenant name and domain
4. Configure tenant settings (max participants, features, etc.)

### Managing Users
1. Select a tenant
2. Go to the "Users" tab
3. Click "Add User"
4. Enter user details and assign role

### Creating Meetings
1. Select a tenant
2. Go to the "Meetings" tab
3. Click "New Meeting"
4. Configure meeting settings
5. Share meeting link with participants

### Joining Meetings
1. Click "Join" on an active meeting
2. Allow camera and microphone permissions
3. Use meeting controls for audio/video/screen sharing

## 🔒 Security

### Multi-Tenant Isolation
- Data is isolated by tenant using DynamoDB partition keys
- API routes validate tenant context
- User permissions are scoped to tenant

### AWS Security
- IAM roles with least privilege access
- DynamoDB encryption at rest
- Secure credential management

## 🚀 Deployment

### Production Build
```bash
pnpm build
```

### Environment Variables
Ensure all production environment variables are set:
- AWS credentials with appropriate permissions
- DynamoDB table name
- Chime SDK configuration

### Recommended Deployment Platforms
- **Netlify**: For frontend hosting
- **Vercel**: For frontend hosting
- **AWS Lambda**: For serverless backend
- **Docker**: For containerized deployment

## 📊 Monitoring

### Key Metrics
- Meeting creation and participation rates
- Tenant usage patterns
- Video quality and connection stability
- API response times

### Logging
- Application logs for debugging
- AWS CloudWatch for infrastructure monitoring
- Chime SDK logs for video performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [Amazon Chime SDK documentation](https://docs.aws.amazon.com/chime/latest/dg/meetings-sdk.html)
- Review AWS service documentation
- Open an issue in this repository

## 🔮 Roadmap

- [ ] Advanced analytics and reporting
- [ ] Meeting templates and recurring meetings
- [ ] Integration with calendar systems
- [ ] Mobile app support
- [ ] Advanced security features (SSO, MFA)
- [ ] White-label customization
- [ ] API for third-party integrations
