/**
 * Attendance Service
 * 
 * This module contains business logic for recording student attendance.
 * It handles validation, duplicate checking, and persistence.
 * 
 * Why separate service layer:
 * - Encapsulates attendance recording logic
 * - Handles complex validation rules
 * - Coordinates between models and validation
 * - Makes business logic testable
 */

const attendanceModel = require('../models/attendance.model');
const sessionService = require('./session.service');
const validationService = require('./validation.service');
const timeUtil = require('../utils/time.util');

/**
 * Records student attendance for a session
 * 
 * This is the main function for marking attendance.
 * It validates input, checks session validity, prevents duplicates,
 * and saves the attendance record.
 * 
 * @param {string} sessionId - UUID of the session
 * @param {number} rollNo - Student roll number
 * @returns {Promise<Object>} Created attendance record
 */
async function markAttendance(sessionId, rollNo) {
  // Validate input format
  const inputValidation = validationService.validateAttendanceInput({
    sessionId,
    rollNo
  });
  
  if (!inputValidation.isValid) {
    const error = new Error('Invalid attendance input parameters');
    error.validationErrors = inputValidation.errors;
    throw error;
  }
  
  // Validate session is active and not expired
  const sessionValidation = await sessionService.validateSessionForAttendance(sessionId);
  
  if (!sessionValidation.isValid) {
    const error = new Error(sessionValidation.message);
    error.errorCode = sessionValidation.errorCode;
    throw error;
  }
  
  // Check for duplicate attendance
  // This prevents the same student from marking attendance twice
  const isDuplicate = await attendanceModel.checkDuplicate(sessionId, rollNo);
  
  if (isDuplicate) {
    const error = new Error('Attendance already recorded for this roll number');
    error.errorCode = 'DUPLICATE_ENTRY';
    throw error;
  }
  
  // Get current timestamp for the attendance record
  const timestamp = timeUtil.getCurrentTimeISO();
  
  // Create attendance record object
  const attendanceRecord = {
    sessionId: sessionId,
    rollNo: rollNo,
    timestamp: timestamp,
    status: 'present', // All successful submissions are marked as present
    createdAt: timestamp
  };
  
  // Save attendance record to storage
  await attendanceModel.createAttendanceRecord(attendanceRecord);
  
  return attendanceRecord;
}

/**
 * Retrieves all attendance records for a session
 * 
 * This loads attendance data for report generation or display.
 * Records are sorted by timestamp (chronological order).
 * 
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<Array>} Array of attendance records
 */
async function getAttendanceBySession(sessionId) {
  // Validate sessionId format
  if (!validationService.isValidSessionId(sessionId)) {
    return [];
  }
  
  // Retrieve attendance records from storage
  const attendance = await attendanceModel.getAttendanceBySession(sessionId);
  
  // Sort by timestamp (earliest first)
  // This ensures chronological order in reports
  attendance.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });
  
  return attendance;
}

/**
 * Checks if a roll number has marked attendance for a session
 * 
 * This is used to show students if they've already submitted attendance.
 * 
 * @param {string} sessionId - UUID of the session
 * @param {number} rollNo - Student roll number
 * @returns {Promise<Object>} Object with hasMarked flag and timestamp if found
 */
async function checkAttendanceStatus(sessionId, rollNo) {
  // Validate input
  const inputValidation = validationService.validateAttendanceInput({
    sessionId,
    rollNo
  });
  
  if (!inputValidation.isValid) {
    return {
      hasMarked: false,
      timestamp: null
    };
  }
  
  // Check for existing record
  const record = await attendanceModel.getAttendanceRecord(sessionId, rollNo);
  
  if (record) {
    return {
      hasMarked: true,
      timestamp: record.timestamp
    };
  }
  
  return {
    hasMarked: false,
    timestamp: null
  };
}

/**
 * Counts total attendance for a session
 * 
 * This provides a quick count without loading all records.
 * Used for displaying attendance count to teachers.
 * 
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<number>} Count of attendance records
 */
async function countAttendanceBySession(sessionId) {
  // Validate sessionId format
  if (!validationService.isValidSessionId(sessionId)) {
    return 0;
  }
  
  // Get count from model
  const count = await attendanceModel.countAttendanceBySession(sessionId);
  return count;
}

module.exports = {
  markAttendance,
  getAttendanceBySession,
  checkAttendanceStatus,
  countAttendanceBySession
};

