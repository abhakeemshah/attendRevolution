// server/routes/report.routes.js

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/reports/session/:sessionId/:format
 * @desc    Generate and download an attendance report
 * @access  Private (Teacher only)
 */
router.get('/session/:sessionId/:format', protect, authorize('teacher'), reportController.generateReport);

module.exports = router;

