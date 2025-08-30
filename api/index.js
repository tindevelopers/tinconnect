const express = require('express');
const { config } = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tinconnect.com', 'https://www.tinconnect.com', 'https://develop.tinconnect.com']
    : ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the built React app
app.use(express.static(path.join(__dirname, '../dist/spa')));

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
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

app.get('/api/demo', (req, res) => {
  res.json({ 
    message: 'Hello from serverless API!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Tenant management routes (simplified for now)
app.get('/api/tenants/:tenantId', (req, res) => {
  res.json({ 
    id: req.params.tenantId,
    name: 'Default Tenant',
    message: 'Tenant endpoint working'
  });
});

app.get('/api/tenants/:tenantId/users', (req, res) => {
  res.json({ 
    tenantId: req.params.tenantId,
    users: [],
    message: 'Users endpoint working'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // Serve the React app's index.html for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, '../dist/spa/index.html'));
});

// Export the Express app for Vercel
module.exports = app;
