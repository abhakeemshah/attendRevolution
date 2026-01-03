/**
 * Main Application Entry Point
 * 
 * This is the Express application setup file.
 * It configures middleware, routes, and error handling.
 * 
 * Why this structure:
 * - Clear separation of concerns
 * - Easy to add middleware
 * - Centralized error handling
 * - Easy to test and maintain
 */

const express = require('express');
const config = require('./config/config');
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

// Import route modules
const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const reportRoutes = require('./routes/report.routes');

// Create Express application
const app = express();

// Middleware: Parse JSON request bodies
// This allows us to access req.body in route handlers
app.use(express.json());

// Middleware: Parse URL-encoded request bodies
// Useful for form submissions (though we primarily use JSON)
app.use(express.urlencoded({ extended: true }));

// Middleware: CORS (Cross-Origin Resource Sharing)
// Allows frontend to make requests from different origins
// In production, restrict to actual domain
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (config.cors.allowedOrigins.includes(origin) || config.server.environment === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// API Routes
// All API endpoints are prefixed with /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/reports', reportRoutes);

// Health check endpoint
// Useful for monitoring and load balancers
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined API routes
app.use('/api/v1/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found'
    }
  });
});

// Global error handler
// Catches any unhandled errors and returns appropriate response
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// Start server
// Listen on configured port and host
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${config.server.environment}`);
  console.log(`API Endpoint: http://${HOST}:${PORT}/api`);
});

module.exports = app;

