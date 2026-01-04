// server/routes/report.routes.js

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const teacherAuth = require('../middlewares/teacherAuth.middleware'); // Import the new middleware

// Note: The old 'protect' and 'authorize' middlewares are replaced by 'teacherAuth'.

/**
 * @route   GET /api/reports/session/:sessionId/:format
 * @desc    Generate and download an attendance report for a specific session.
 * @access  Private (Teacher only)
 */
router.get('/session/:sessionId/:format', teacherAuth, reportController.generateReport);

module.exports = router;
