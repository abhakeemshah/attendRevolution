// server/routes/attendance.routes.js

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/attendance/session/:sessionId/mark
 * @desc    Mark attendance for a session
 * @access  Private (Student only)
 */
router.post('/session/:sessionId/mark', protect, authorize('student'), attendanceController.markAttendance);

/**
 * @route   GET /api/attendance/session/:sessionId
 * @desc    Get all attendance records for a session
 * @access  Private (Teacher only)
 */
router.get('/session/:sessionId', protect, authorize('teacher'), attendanceController.getAttendanceBySession);

module.exports = router;


