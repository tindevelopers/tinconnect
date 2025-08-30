import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { handlePing } from './routes/ping.js';
import { handleDemo } from './routes/demo.js';
import { getTenant, getUsers } from './routes/tenants.js';

// Load environment variables
config({ path: '.env.local' }); // Load local environment variables first
config(); // Then load any other .env files

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tinconnect.com', 'https://www.tinconnect.com', 'https://develop.tinconnect.com']
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'https://develop.tinconnect.com'],
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
app.get('/api/ping', handlePing);
app.get('/api/demo', handleDemo);

// Tenant management (still needed for user context)
app.get('/api/tenants/:tenantId', getTenant);
app.get('/api/tenants/:tenantId/users', getUsers);

// Serve static files
if (isDevelopment) {
  // In development, serve from the Vite dev server
  // We'll proxy to Vite dev server for the React app
  console.log('🔧 Development mode: API server only');
  console.log('📝 Start Vite dev server separately with: npm run dev:client');
} else {
  // In production, serve the built React app
  app.use(express.static(path.join(__dirname, '../dist/spa')));
  
  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(__dirname, '../dist/spa/index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Unified server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Mode: ${isDevelopment ? 'Development (API only)' : 'Production (API + React)'}`);
  console.log(`🌐 CORS origins: ${process.env.NODE_ENV === 'production' ? 'Production domains' : 'Localhost'}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  
  if (isDevelopment) {
    console.log(`💡 For React app, start Vite dev server: npm run dev:client`);
    console.log(`💡 Then access React app at: http://localhost:8080 (or next available port)`);
  }
});
