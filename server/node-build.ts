import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import path from "path";
import { handlePing } from './routes/ping.js';
import { handleDemo } from './routes/demo.js';
import { getTenant, getUsers } from './routes/tenants.js';

// Load environment variables
config(); // Load .env files

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tinconnect.com', 'https://www.tinconnect.com', 'https://develop.tinconnect.com']
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    serverless: 'Meeting functionality moved to AWS Lambda'
  });
});

// API Routes
app.get('/api/ping', handlePing);
app.get('/api/demo', handleDemo);

// Tenant management (still needed for user context)
app.get('/api/tenants/:tenantId', getTenant);
app.get('/api/tenants/:tenantId/users', getUsers);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Serverless-ready server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔧 Meeting functionality: AWS Lambda (serverless)`);
  console.log(`🌐 CORS origins: ${process.env.NODE_ENV === 'production' ? 'Production domains' : 'Localhost'}`);
  console.log(`📝 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
