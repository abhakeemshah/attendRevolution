/**
 * Validation Service
 * 
 * This module provides input validation and business rule validation.
 * All validation logic is centralized here for consistency and maintainability.
 * 
 * Why separate validation service:
 * - Single source of truth for validation rules
 * - Reusable across different controllers
 * - Easy to test validation logic independently
 * - Clear separation between validation and business logic
 */

const config = require('../config/config');
const timeUtil = require('../utils/time.util');

/**
 * Validates session creation input parameters
 * 
 * This ensures all required fields are present and within acceptable ranges.
 * We validate on the server side to prevent invalid data from entering the system.
 * 
 * @param {Object} sessionData - Object containing class, subject, section, duration
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateSessionInput(sessionData) {
  const errors = [];
  
  // Validate class name
  if (!sessionData.class || typeof sessionData.class !== 'string') {
    errors.push({
      field: 'class',
      message: 'Class name is required and must be a string'
    });
  } else if (sessionData.class.trim().length === 0) {
    errors.push({
      field: 'class',
      message: 'Class name cannot be empty'
    });
  } else if (sessionData.class.length > config.validation.classNameMaxLength) {
    errors.push({
      field: 'class',
      message: `Class name must be ${config.validation.classNameMaxLength} characters or less`
    });
  }
  
  // Validate subject name
  if (!sessionData.subject || typeof sessionData.subject !== 'string') {
    errors.push({
      field: 'subject',
      message: 'Subject name is required and must be a string'
    });
  } else if (sessionData.subject.trim().length === 0) {
    errors.push({
      field: 'subject',
      message: 'Subject name cannot be empty'
    });
  } else if (sessionData.subject.length > config.validation.subjectNameMaxLength) {
    errors.push({
      field: 'subject',
      message: `Subject name must be ${config.validation.subjectNameMaxLength} characters or less`
    });
  }
  
  // Validate section
  if (!sessionData.section || typeof sessionData.section !== 'string') {
    errors.push({
      field: 'section',
      message: 'Section is required and must be a string'
    });
  } else if (sessionData.section.trim().length === 0) {
    errors.push({
      field: 'section',
      message: 'Section cannot be empty'
    });
  } else if (sessionData.section.length > config.validation.sectionNameMaxLength) {
    errors.push({
      field: 'section',
      message: `Section must be ${config.validation.sectionNameMaxLength} characters or less`
    });
  }
  
  // Validate duration
  if (typeof sessionData.duration !== 'number') {
    errors.push({
      field: 'duration',
      message: 'Duration is required and must be a number'
    });
  } else if (sessionData.duration < config.session.minDurationMinutes) {
    errors.push({
      field: 'duration',
      message: `Duration must be at least ${config.session.minDurationMinutes} minutes`
    });
  } else if (sessionData.duration > config.session.maxDurationMinutes) {
    errors.push({
      field: 'duration',
      message: `Duration must be at most ${config.session.maxDurationMinutes} minutes`
    });
  } else if (!Number.isInteger(sessionData.duration)) {
    errors.push({
      field: 'duration',
      message: 'Duration must be a whole number'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates attendance marking input parameters
 * 
 * This ensures sessionId and rollNo are valid before processing attendance.
 * 
 * @param {Object} attendanceData - Object containing sessionId and rollNo
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateAttendanceInput(attendanceData) {
  const errors = [];
  
  // Validate sessionId format (should be UUID)
  if (!attendanceData.sessionId || typeof attendanceData.sessionId !== 'string') {
    errors.push({
      field: 'sessionId',
      message: 'Session ID is required and must be a string'
    });
  } else {
    // Basic UUID format validation (v4 format)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(attendanceData.sessionId)) {
      errors.push({
        field: 'sessionId',
        message: 'Session ID must be a valid UUID format'
      });
    }
  }
  
  // Validate roll number
  if (typeof attendanceData.rollNo !== 'number') {
    errors.push({
      field: 'rollNo',
      message: 'Roll number is required and must be a number'
    });
  } else if (!Number.isInteger(attendanceData.rollNo)) {
    errors.push({
      field: 'rollNo',
      message: 'Roll number must be a whole number'
    });
  } else if (attendanceData.rollNo < config.validation.rollNumberMin) {
    errors.push({
      field: 'rollNo',
      message: `Roll number must be at least ${config.validation.rollNumberMin}`
    });
  } else if (attendanceData.rollNo > config.validation.rollNumberMax) {
    errors.push({
      field: 'rollNo',
      message: `Roll number must be at most ${config.validation.rollNumberMax}`
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates if a session is active and not expired
 * 
 * This checks both the isActive flag and the expiry time.
 * A session can be marked inactive but still within time window, or vice versa.
 * 
 * @param {Object} session - Session object to validate
 * @returns {Object} Validation result with isValid flag and error message
 */
function validateSessionActive(session) {
  // Check if session exists
  if (!session) {
    return {
      isValid: false,
      errorCode: 'SESSION_NOT_FOUND',
      message: 'Session not found'
    };
  }
  
  // Check if session is marked as active
  if (!session.isActive) {
    return {
      isValid: false,
      errorCode: 'SESSION_INACTIVE',
      message: 'Session is not active'
    };
  }
  
  // Check if session has expired based on endTime
  if (timeUtil.hasTimePassed(session.endTime)) {
    return {
      isValid: false,
      errorCode: 'SESSION_EXPIRED',
      message: 'Session has expired'
    };
  }
  
  return {
    isValid: true
  };
}

/**
 * Validates sessionId format
 * 
 * Helper function to check if a string is a valid UUID format.
 * 
 * @param {string} sessionId - Session ID to validate
 * @returns {boolean} True if valid UUID format, false otherwise
 */
function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(sessionId);
}

module.exports = {
  validateSessionInput,
  validateAttendanceInput,
  validateSessionActive,
  isValidSessionId
};

