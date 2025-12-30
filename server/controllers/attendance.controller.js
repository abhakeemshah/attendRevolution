/**
 * Attendance Controller
 * 
 * This module handles HTTP requests related to attendance marking.
 * Controllers extract request data, call services, and format responses.
 * 
 * Why separate controller layer:
 * - Handles HTTP-specific concerns (status codes, headers)
 * - Services remain HTTP-agnostic
 * - Consistent error handling and response formatting
 * - Easy to modify API responses without changing business logic
 */

const attendanceService = require('../services/attendance.service');

/**
 * Handles POST /api/attendance/mark request
 * 
 * Records student attendance for a session.
 * Validates input, checks session validity, prevents duplicates.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function markAttendance(req, res) {
  try {
    const { sessionId, rollNo } = req.body;
    
    // Call service to mark attendance
    // Service handles all validation and business logic
    const attendanceRecord = await attendanceService.markAttendance(sessionId, rollNo);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        sessionId: attendanceRecord.sessionId,
        rollNo: attendanceRecord.rollNo,
        timestamp: attendanceRecord.timestamp,
        status: attendanceRecord.status
      }
    });
  } catch (error) {
    // Handle validation errors
    if (error.validationErrors) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input parameters',
          details: error.validationErrors
        }
      });
    }
    
    // Handle session-related errors
    if (error.errorCode === 'SESSION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }
    
    if (error.errorCode === 'SESSION_EXPIRED' || error.errorCode === 'SESSION_INACTIVE') {
      return res.status(403).json({
        success: false,
        error: {
          code: error.errorCode,
          message: error.message
        }
      });
    }
    
    // Handle duplicate entry error
    if (error.errorCode === 'DUPLICATE_ENTRY') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Attendance already recorded for this roll number'
        }
      });
    }
    
    // Handle other errors
    console.error('Error marking attendance:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark attendance'
      }
    });
  }
}

/**
 * Handles GET /api/attendance/session/:sessionId request
 * 
 * Retrieves all attendance records for a specific session.
 * Used for generating reports or viewing attendance list.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAttendanceBySession(req, res) {
  try {
    const { sessionId } = req.params;
    
    // Get attendance records from service
    const attendance = await attendanceService.getAttendanceBySession(sessionId);
    
    // TODO: In future, we could add session details here
    // For now, we just return the attendance records
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: sessionId,
        totalAttendance: attendance.length,
        attendance: attendance
      }
    });
  } catch (error) {
    console.error('Error getting attendance:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve attendance records'
      }
    });
  }
}

/**
 * Handles GET /api/attendance/check request
 * 
 * Checks if a roll number has already marked attendance for a session.
 * Used by students to verify their attendance status.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function checkAttendanceStatus(req, res) {
  try {
    const { sessionId, rollNo } = req.query;
    
    // Validate required query parameters
    if (!sessionId || !rollNo) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'sessionId and rollNo query parameters are required'
        }
      });
    }
    
    // Parse rollNo as number
    const rollNumber = parseInt(rollNo, 10);
    if (isNaN(rollNumber)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'rollNo must be a valid number'
        }
      });
    }
    
    // Check attendance status
    const status = await attendanceService.checkAttendanceStatus(sessionId, rollNumber);
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: sessionId,
        rollNo: rollNumber,
        hasMarked: status.hasMarked,
        timestamp: status.timestamp
      }
    });
  } catch (error) {
    console.error('Error checking attendance status:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check attendance status'
      }
    });
  }
}

module.exports = {
  markAttendance,
  getAttendanceBySession,
  checkAttendanceStatus
};

