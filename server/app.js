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
const path = require('path');
const config = require('./config/config');

// Import route modules
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

// Serve static files from client directory
// This serves the HTML/CSS/JS files for teacher and student interfaces
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
// All API endpoints are prefixed with /api
app.use('/api/session', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/session', reportRoutes); // Reports are under session resource

// Serve teacher interface
// Route: GET /teacher
app.get('/teacher', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/teacher/index.html'));
});

// Serve student interface
// Route: GET /student
app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/student/scan.html'));
});

// Health check endpoint
// Useful for monitoring and load balancers
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
// Returns JSON for API routes, HTML for others
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'API endpoint not found'
      }
    });
  } else {
    res.status(404).sendFile(path.join(__dirname, '../client/404.html'));
  }
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
  console.log(`Teacher Interface: http://${HOST}:${PORT}/teacher`);
  console.log(`Student Interface: http://${HOST}:${PORT}/student`);
  console.log(`API Endpoint: http://${HOST}:${PORT}/api`);
});

module.exports = app;

