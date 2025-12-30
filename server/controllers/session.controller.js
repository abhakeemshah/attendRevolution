/**
 * Session Controller
 * 
 * This module handles HTTP requests related to attendance sessions.
 * Controllers are responsible for:
 * - Extracting data from HTTP requests
 * - Calling appropriate services
 * - Formatting HTTP responses
 * - Handling errors and status codes
 * 
 * Why separate controller layer:
 * - Routes handle routing, controllers handle request/response
 * - Services focus on business logic, not HTTP details
 * - Easy to test controllers independently
 * - Consistent response formatting
 */

const sessionService = require('../services/session.service');
const attendanceService = require('../services/attendance.service');
const timeUtil = require('../utils/time.util');

/**
 * Handles POST /api/session/start request
 * 
 * Creates a new attendance session with QR code.
 * Validates input, creates session, and returns session details with QR code.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function startSession(req, res) {
  try {
    // Extract request body data
    const { class: className, subject, section, duration } = req.body;
    
    // Call service to create session
    // Service handles all validation and business logic
    const session = await sessionService.createSession({
      class: className,
      subject,
      section,
      duration
    });
    
    // Return success response with session data
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session
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
    
    // Handle other errors
    console.error('Error starting session:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create session'
      }
    });
  }
}

/**
 * Handles GET /api/session/:sessionId request
 * 
 * Retrieves session details including attendance count and time remaining.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getSession(req, res) {
  try {
    const { sessionId } = req.params;
    
    // Get session from service
    const session = await sessionService.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }
    
    // Get attendance count for this session
    const attendanceCount = await attendanceService.countAttendanceBySession(sessionId);
    
    // Calculate time remaining
    const timeRemaining = timeUtil.getRemainingSeconds(session.endTime);
    
    // Return session data with additional computed fields
    res.status(200).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        class: session.class,
        subject: session.subject,
        section: session.section,
        duration: session.duration,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive,
        attendanceCount: attendanceCount,
        timeRemaining: timeRemaining
      }
    });
  } catch (error) {
    console.error('Error getting session:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve session'
      }
    });
  }
}

/**
 * Handles POST /api/session/end request
 * 
 * Ends an active attendance session, preventing further submissions.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function endSession(req, res) {
  try {
    const { sessionId } = req.body;
    
    // Call service to end session
    const session = await sessionService.endSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }
    
    // Check if session was already ended
    if (!session.isActive && session.endedAt) {
      // Get attendance count for response
      const attendanceCount = await attendanceService.countAttendanceBySession(sessionId);
      
      return res.status(200).json({
        success: true,
        message: 'Session was already ended',
        data: {
          sessionId: session.sessionId,
          isActive: false,
          totalAttendance: attendanceCount,
          endTime: session.endedAt
        }
      });
    }
    
    // Get attendance count for response
    const attendanceCount = await attendanceService.countAttendanceBySession(sessionId);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Session ended successfully',
      data: {
        sessionId: session.sessionId,
        isActive: false,
        totalAttendance: attendanceCount,
        endTime: session.endedAt
      }
    });
  } catch (error) {
    console.error('Error ending session:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to end session'
      }
    });
  }
}

/**
 * Handles GET /api/session/active request
 * 
 * Retrieves all currently active sessions.
 * Used by teachers to see what sessions are running.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getActiveSessions(req, res) {
  try {
    // Get active sessions from service
    const sessions = await sessionService.getActiveSessions();
    
    // Enrich sessions with attendance count and time remaining
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const attendanceCount = await attendanceService.countAttendanceBySession(session.sessionId);
        const timeRemaining = timeUtil.getRemainingSeconds(session.endTime);
        
        return {
          sessionId: session.sessionId,
          class: session.class,
          subject: session.subject,
          section: session.section,
          startTime: session.startTime,
          endTime: session.endTime,
          attendanceCount: attendanceCount,
          timeRemaining: timeRemaining
        };
      })
    );
    
    // Return active sessions
    res.status(200).json({
      success: true,
      data: {
        sessions: enrichedSessions,
        total: enrichedSessions.length
      }
    });
  } catch (error) {
    console.error('Error getting active sessions:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve active sessions'
      }
    });
  }
}

module.exports = {
  startSession,
  getSession,
  endSession,
  getActiveSessions
};

