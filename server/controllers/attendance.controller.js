// server/controllers/attendance.controller.js

const attendanceService = require('../services/attendance.service');

// Validation helper for roll numbers (alphanumeric with optional dashes/underscores)
const ROLL_REGEX = /^[A-Za-z0-9_-]+$/;

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
    // The student's roll number and QR token are submitted in the request body.
    const { rollNumber, qrToken } = req.body;

    // Identify the device via User-Agent and IP. We accept `x-forwarded-for`
    // header to allow proxies and testing to simulate client IPs. The service
    // uses these values to compute a deviceHash and enforce one-device-per-session.
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.ip || '';

    // Basic validation for required fields and formats. Return consistent
    // VALIDATION_ERROR result to match API contract for client errors.
    if (!rollNumber || typeof rollNumber !== 'string' || !ROLL_REGEX.test(rollNumber)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or missing rollNumber.',
        },
      });
    }

    if (!qrToken || typeof qrToken !== 'string' || qrToken.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or missing qrToken.',
        },
      });
    }

    // Delegate to the service layer which will perform session QR validation
    // and duplicate attendance checks.
    // Pass userAgent and ip to the service to generate deviceHash and enforce
    // device-based submission limits.
    const attendanceRecord = await attendanceService.markAttendance(
      sessionId,
      rollNumber,
      qrToken,
      userAgent,
      ip
    );

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
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

