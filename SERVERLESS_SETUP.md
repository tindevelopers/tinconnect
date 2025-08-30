# 🚀 Serverless Video Conferencing Setup

This project now uses **AWS Lambda functions** for video conferencing instead of the Express server, providing better scalability and cost-effectiveness.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   CORS Proxy     │    │  AWS Lambda     │
│   (Frontend)    │───▶│   (Port 8082)    │───▶│   Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Express       │    │   API Gateway    │    │   DynamoDB      │
│   (Auth/Users)  │    │   (CORS Fixed)   │    │   (Meetings)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Key Components

### 1. **Frontend Components**
- `ChimeSDKServerless.tsx` - Video conferencing using serverless backend
- `StartMeetingServerless.tsx` - Meeting creation/joining interface
- `StartMeetingPage.tsx` - Updated to use serverless components

### 2. **Backend Services**
- **Express Server** - Handles authentication and user management only
- **CORS Proxy** - Resolves CORS issues with API Gateway
- **AWS Lambda** - Manages meetings, attendees, and Chime SDK operations

### 3. **AWS Infrastructure**
- **Lambda Functions** - Meeting management logic
- **API Gateway** - RESTful API endpoints
- **DynamoDB** - Meeting and attendee data storage
- **SQS** - Meeting notifications
- **CloudWatch** - Logging and monitoring

## 🚀 Quick Start

### 1. **Start the CORS Proxy**
```bash
node cors-proxy.cjs
```
This runs on `http://localhost:8082` and proxies requests to the API Gateway.

### 2. **Start the Development Server**
```bash
# Option 1: Full serverless setup
npm run dev:serverless

# Option 2: Traditional setup (still available)
npm run dev
```

### 3. **Access the Application**
- **Frontend**: `http://localhost:8080`
- **CORS Proxy**: `http://localhost:8082`
- **Health Check**: `http://localhost:8080/health`

## 📋 API Endpoints

### Serverless Endpoints (via CORS Proxy)
```
POST /api/join     - Create/join a meeting
POST /api/end      - End a meeting
GET  /api/attendee - Get attendee information
```

### Express Server Endpoints
```
GET  /api/ping                    - Health check
GET  /api/demo                    - Demo endpoint
GET  /api/tenants/:id             - Get tenant info
GET  /api/tenants/:id/users       - Get tenant users
```

## 🔧 Configuration

### Environment Variables
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server Configuration
PORT=8080
NODE_ENV=development
```

### CORS Proxy Configuration
The CORS proxy (`cors-proxy.cjs`) handles:
- ✅ CORS headers for all requests
- ✅ Proxying to API Gateway
- ✅ Request/response transformation
- ✅ Error handling

## 🎥 Video Conferencing Features

### ✅ Implemented Features
- **Camera Preview** - Test camera before joining
- **Device Selection** - Choose camera/microphone
- **Real-time Video** - Live video streaming
- **Audio Controls** - Mute/unmute functionality
- **Video Controls** - Enable/disable video
- **Screen Sharing** - Share screen content
- **Meeting Management** - Create/join/leave meetings

### 🔄 Meeting Flow
1. **Create/Join Meeting** → Serverless API
2. **Camera Preview** → Local device testing
3. **Start Meeting** → Chime SDK initialization
4. **Video Conference** → Real-time communication
5. **Leave Meeting** → Cleanup and end session

## 🛠️ Development Workflow

### 1. **Local Development**
```bash
# Terminal 1: Start CORS proxy
node cors-proxy.cjs

# Terminal 2: Start development server
npm run dev:serverless

# Terminal 3: Start static file server (for testing)
python3 -m http.server 8081
```

### 2. **Testing**
- **Frontend**: `http://localhost:8080`
- **Test Page**: `http://localhost:8081/test-chime-serverless.html`
- **API Testing**: Use the CORS proxy endpoints

### 3. **Debugging**
- Check browser console for detailed logs
- Monitor CORS proxy logs
- Check CloudWatch logs for Lambda functions
- Use browser dev tools for network requests

## 📊 Benefits of Serverless Architecture

### ✅ **Scalability**
- Automatic scaling based on demand
- No server management required
- Pay-per-use pricing model

### ✅ **Reliability**
- High availability with AWS infrastructure
- Automatic failover and recovery
- Built-in monitoring and logging

### ✅ **Cost-Effectiveness**
- No idle server costs
- Pay only for actual usage
- Reduced operational overhead

### ✅ **Performance**
- Global edge locations
- Low latency connections
- Optimized for real-time communication

## 🔍 Troubleshooting

### Common Issues

#### 1. **CORS Errors**
```bash
# Solution: Ensure CORS proxy is running
node cors-proxy.cjs
```

#### 2. **Video Not Showing**
- Check camera permissions
- Verify device selection
- Check browser console for errors

#### 3. **Meeting Creation Fails**
- Verify AWS credentials
- Check Lambda function logs
- Ensure API Gateway is accessible

#### 4. **Authentication Issues**
- Check Supabase configuration
- Verify environment variables
- Check Express server logs

### Debug Commands
```bash
# Test CORS proxy
curl -X POST http://localhost:8082/api/join \
  -H "Content-Type: application/json" \
  -d '{"title": "test", "attendeeName": "test"}'

# Check server health
curl http://localhost:8080/health

# Test API Gateway directly
curl -X POST https://wlid311tl7.execute-api.us-east-1.amazonaws.com/Prod/join \
  -H "Content-Type: application/json" \
  -d '{"title": "test", "attendeeName": "test"}'
```

## 🚀 Deployment

### Production Deployment
1. **Frontend**: Deploy to Vercel/Netlify
2. **CORS Proxy**: Deploy to AWS Lambda or EC2
3. **Serverless Functions**: Already deployed via SAM
4. **Database**: DynamoDB (managed by AWS)

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
CORS_PROXY_URL=https://your-cors-proxy.com
API_GATEWAY_URL=https://your-api-gateway.com
```

## 📚 Additional Resources

- [AWS Chime SDK Documentation](https://docs.aws.amazon.com/chime-sdk/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)

## 🎉 Success!

Your video conferencing system is now running on a **fully serverless architecture** with:
- ✅ **Scalable** AWS Lambda functions
- ✅ **Real-time** video communication
- ✅ **Cost-effective** pay-per-use model
- ✅ **Reliable** AWS infrastructure
- ✅ **Modern** React frontend

**Happy video conferencing! 🎥✨**
