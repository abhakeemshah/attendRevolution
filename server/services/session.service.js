/**
 * Session Service
 * 
 * This module contains business logic for managing attendance sessions.
 * It coordinates between models, validation, and QR code generation.
 * 
 * Why separate service layer:
 * - Controllers handle HTTP, services handle business logic
 * - Reusable logic that can be called from different places
 * - Easier to test business logic independently
 * - Clear separation of concerns
 */

const { v4: uuidv4 } = require('uuid');
const sessionModel = require('../models/session.model');
const validationService = require('./validation.service');
const qrService = require('./qr.service');
const timeUtil = require('../utils/time.util');
const config = require('../config/config');

/**
 * Creates a new attendance session
 * 
 * This is the main entry point for starting an attendance session.
 * It validates input, generates a session ID, creates timestamps,
 * generates QR code, and saves everything to storage.
 * 
 * @param {Object} sessionData - Object containing class, subject, section, duration
 * @returns {Promise<Object>} Created session object with QR code
 */
async function createSession(sessionData) {
  // Validate input parameters
  const validation = validationService.validateSessionInput(sessionData);
  if (!validation.isValid) {
    const error = new Error('Invalid session input parameters');
    error.validationErrors = validation.errors;
    throw error;
  }
  
  // Generate unique session ID
  // UUID v4 ensures uniqueness across all sessions
  const sessionId = uuidv4();
  
  // Calculate timestamps
  const startTime = timeUtil.getCurrentTimeISO();
  const endTime = timeUtil.addMinutesToTime(startTime, sessionData.duration);
  
  // Generate QR code for the session
  // QR code contains sessionId and expiry time for validation
  const qrCodeData = await qrService.generateQRCode(sessionId, endTime);
  
  // Build session object
  const session = {
    sessionId: sessionId,
    class: sessionData.class.trim(),
    subject: sessionData.subject.trim(),
    section: sessionData.section.trim(),
    duration: sessionData.duration,
    startTime: startTime,
    endTime: endTime,
    isActive: true,
    createdAt: startTime,
    endedAt: null
  };
  
  // Save session to storage
  await sessionModel.createSession(session);
  
  // Return session with QR code data
  return {
    ...session,
    qrCode: qrCodeData.qrCode,
    qrData: qrCodeData.qrData
  };
}

/**
 * Retrieves a session by its ID
 * 
 * This loads a session from storage and checks if it's still valid.
 * Used when students scan QR codes or teachers view session details.
 * 
 * @param {string} sessionId - UUID of the session
 * @returns {Promise<Object|null>} Session object if found, null otherwise
 */
async function getSessionById(sessionId) {
  // Validate sessionId format
  if (!validationService.isValidSessionId(sessionId)) {
    return null;
  }
  
  // Retrieve session from storage
  const session = await sessionModel.getSessionById(sessionId);
  return session;
}

/**
 * Retrieves all currently active sessions
 * 
 * Active sessions are those that haven't expired and haven't been manually ended.
 * Used to show teachers what sessions are running.
 * 
 * @returns {Promise<Array>} Array of active session objects
 */
async function getActiveSessions() {
  const sessions = await sessionModel.getActiveSessions();
  
  // Filter out expired sessions (even if marked as active)
  // This ensures we don't show expired sessions as active
  const now = new Date();
  const validSessions = sessions.filter(session => {
    const endTime = new Date(session.endTime);
    return endTime > now;
  });
  
  return validSessions;
}

/**
 * Ends an attendance session
 * 
 * This marks a session as inactive, preventing further attendance submissions.
 * Teachers can end sessions manually, or they expire automatically.
 * 
 * @param {string} sessionId - UUID of the session to end
 * @returns {Promise<Object|null>} Updated session object if found, null otherwise
 */
async function endSession(sessionId) {
  // Validate sessionId format
  if (!validationService.isValidSessionId(sessionId)) {
    return null;
  }
  
  // Retrieve session to verify it exists
  const session = await sessionModel.getSessionById(sessionId);
  if (!session) {
    return null;
  }
  
  // Check if session is already ended
  if (!session.isActive) {
    // Return session as-is if already ended
    // This allows idempotent calls (calling end multiple times is safe)
    return session;
  }
  
  // Update session to mark as inactive
  const endTime = timeUtil.getCurrentTimeISO();
  const updatedSession = await sessionModel.updateSession(sessionId, {
    isActive: false,
    endedAt: endTime
  });
  
  return updatedSession;
}

/**
 * Validates if a session is active and can accept attendance
 * 
 * This checks both the isActive flag and expiry time.
 * Used before allowing attendance submissions.
 * 
 * @param {string} sessionId - UUID of the session to validate
 * @returns {Promise<Object>} Validation result with isValid flag and error info
 */
async function validateSessionForAttendance(sessionId) {
  // Get session from storage
  const session = await getSessionById(sessionId);
  
  // Use validation service to check if session is active
  const validation = validationService.validateSessionActive(session);
  
  return validation;
}

module.exports = {
  createSession,
  getSessionById,
  getActiveSessions,
  endSession,
  validateSessionForAttendance
};

