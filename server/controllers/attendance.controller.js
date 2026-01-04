// server/controllers/attendance.controller.js

const attendanceService = require('../services/attendance.service');

/**
 * Handles POST /api/attendance/session/:sessionId/mark
 * 
 * Marks student attendance for a session using their roll number.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function markAttendance(req, res, next) {
  try {
    const { sessionId } = req.params;
    // The student's roll number is now submitted in the request body.
    const { rollNumber } = req.body;

    if (!rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required.',
      });
    }

    const attendanceRecord = await attendanceService.markAttendance(sessionId, rollNumber);

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully.',
      data: {
        attendanceRecord,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles GET /api/attendance/session/:sessionId
 * 
 * Retrieves all attendance records for a specific session.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function getAttendanceBySession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const attendance = await attendanceService.getAttendanceBySession(sessionId);

    res.status(200).json({
      success: true,
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  markAttendance,
  getAttendanceBySession,
};

