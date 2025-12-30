/**
 * Session Routes
 * 
 * This module defines HTTP routes for session management.
 * Routes map URLs to controller functions.
 * 
 * Why separate routes:
 * - Clean URL structure
 * - Easy to modify API endpoints
 * - Centralized route definitions
 * - Easy to add middleware to specific routes
 */

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

/**
 * POST /api/session/start
 * 
 * Creates a new attendance session.
 * Request body: { class, subject, section, duration }
 */
router.post('/start', sessionController.startSession);

/**
 * GET /api/session/:sessionId
 * 
 * Retrieves details of a specific session.
 * URL parameter: sessionId (UUID)
 */
router.get('/:sessionId', sessionController.getSession);

/**
 * POST /api/session/end
 * 
 * Ends an active attendance session.
 * Request body: { sessionId }
 */
router.post('/end', sessionController.endSession);

/**
 * GET /api/session/active
 * 
 * Retrieves all currently active sessions.
 * No parameters required.
 */
router.get('/active', sessionController.getActiveSessions);

module.exports = router;

