const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import the Express app from the server
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tinconnect-1yp0vov1k-tindeveloper.vercel.app', 'https://tinconnect-tindeveloper.vercel.app']
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.get('/api/ping', (req, res) => {
  res.json({ message: 'TIN Connect API is running!', timestamp: new Date().toISOString() });
});

app.get('/api/demo', (req, res) => {
  res.json({ 
    message: 'Demo endpoint working!',
    features: ['Multi-tenant', 'Video Conferencing', 'Supabase', 'Chime SDK'],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'TIN Connect API',
    timestamp: new Date().toISOString()
  });
});

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, '../dist/spa')));

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/spa/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Export the serverless handler
module.exports = serverless(app);
