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
const errorHandler = require('./middlewares/error.middleware');

// Swagger UI for API documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Import route modules
const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const reportRoutes = require('./routes/report.routes');

// Create Express application
const app = express();

// Middleware: Parse JSON request bodies
app.use(express.json());

// Middleware: Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Simple CORS enabling middleware. Allowed origins may be provided via
// the ALLOWED_ORIGINS env var (comma-separated). If not provided, allow all.
app.use((req, res, next) => {
  const allowed = config.ALLOWED_ORIGINS ? config.ALLOWED_ORIGINS.split(',') : null;
  const origin = req.headers.origin;

  if (!allowed || allowed.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// API Routes
// All API endpoints are prefixed with /api/v1
app.use('/api/v1/auth', authRoutes);
// Mount session routes under both singular and plural paths for backward
// compatibility. Some docs and clients use `/session` while others expect
// `/sessions` (plural). Mounting both prevents 404s without changing behavior.
app.use('/api/v1/session', sessionRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/reports', reportRoutes);

// Serve Swagger UI at /api/docs (loads docs/openapi.yaml)
try {
  const openapiPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');
  const openapiSpec = YAML.load(openapiPath);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));
} catch (err) {
  console.warn('Failed to load OpenAPI spec for Swagger UI:', err.message);
}

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

// Global error handler must be last
app.use(errorHandler);

const PORT = config.PORT || 3000;
const HOST = config.HOST || '0.0.0.0';

// Connect to DB then start server when not running tests. This prevents the
// application from attempting to connect to the real database during Jest
// runs when the test harness simply needs the Express `app` instance.
if (config.NODE_ENV !== 'test') {
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, HOST, () => {
        console.log(`Server running on http://${HOST}:${PORT}`);
        console.log(`Environment: ${config.NODE_ENV || 'development'}`);
        console.log(`API Endpoint: http://${HOST}:${PORT}/api/v1`);
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  })();
}

module.exports = app;

