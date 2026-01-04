// server/routes/attendance.routes.js

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
// The old auth middleware (protect, authorize) is no longer needed in this file.
const teacherAuth = require('../middlewares/teacherAuth.middleware');

/**
 * @route   POST /api/attendance/session/:sessionId/mark
 * @desc    Mark attendance for a session using a roll number.
 * @access  Public
 */
// This route is now public to allow students to mark attendance without logging in.
router.post('/session/:sessionId/mark', attendanceController.markAttendance);

/**
 * @route   GET /api/attendance/session/:sessionId
 * @desc    Get all attendance records for a session
 * @access  Private (Teacher only)
 */
router.get('/session/:sessionId', teacherAuth, attendanceController.getAttendanceBySession);

module.exports = router;
