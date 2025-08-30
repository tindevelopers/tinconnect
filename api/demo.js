export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Hello from serverless API!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
}
