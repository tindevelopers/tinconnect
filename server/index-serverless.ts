import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { ping } from './routes/ping.js';
import { handleDemo } from './routes/demo.js';
import { tenants } from './routes/tenants.js';

// Load environment variables
config({ path: '.env.local' }); // Load local environment variables first
config(); // Then load any other .env files

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tinconnect.com', 'https://www.tinconnect.com']
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    serverless: 'Meeting functionality moved to AWS Lambda'
  });
});

// API Routes
app.get('/api/ping', ping);
app.get('/api/demo', handleDemo);

// Tenant management (still needed for user context)
app.get('/api/tenants/:tenantId', tenants.getTenant);
app.get('/api/tenants/:tenantId/users', tenants.getTenantUsers);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/spa'));
  
  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile('dist/spa/index.html', { root: '.' });
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serverless-ready server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Meeting functionality: AWS Lambda (serverless)`);
  console.log(`🌐 CORS origins: ${process.env.NODE_ENV === 'production' ? 'Production domains' : 'Localhost'}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
