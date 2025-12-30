/**
 * Attendance Routes
 * 
 * This module defines HTTP routes for attendance operations.
 * Routes handle student attendance submissions and queries.
 * 
 * Why separate routes:
 * - Clear API structure
 * - Easy to add authentication middleware later
 * - Organized by resource type
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

/**
 * POST /api/attendance/mark
 * 
 * Records student attendance for a session.
 * Request body: { sessionId, rollNo }
 */
router.post('/mark', attendanceController.markAttendance);

/**
 * GET /api/attendance/session/:sessionId
 * 
 * Retrieves all attendance records for a session.
 * URL parameter: sessionId (UUID)
 */
router.get('/session/:sessionId', attendanceController.getAttendanceBySession);

/**
 * GET /api/attendance/check
 * 
 * Checks if a roll number has marked attendance.
 * Query parameters: sessionId, rollNo
 */
router.get('/check', attendanceController.checkAttendanceStatus);

module.exports = router;

