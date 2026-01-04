// server/services/session.service.js

const Session = require('../models/session.model');
const crypto = require('crypto');

/**
 * Creates a new attendance session.
 *
 * @param {object} sessionData - The session's data (semester, shift, class, date, type, courseName, courseCode, timeFrom, timeTo, group).
 * @param {string} teacherId - The ID of the teacher creating the session.
 * @returns {Promise<object>} The newly created session.
 */
async function createSession(sessionData, teacherId) {
  // Generate a unique and random token for QR code identification
  const qrToken = crypto.randomBytes(32).toString('hex');

  // Create a new session object with the provided data
  const newSession = new Session({
    ...sessionData,
    teacherId,
    qrToken,
    isActive: true, // A new session is active by default
  });

  // Save the session to the database
  await newSession.save();

  // Return the created session
  return newSession;
}


/**
 * Retrieves a session by its ID.
 *
 * @param {string} sessionId - The ID of the session to retrieve.
 * @returns {Promise<object>} The session object.
 */
async function getSessionById(sessionId) {
  const session = await Session.findById(sessionId);
  if (!session) {
    const error = new Error('Session not found.');
    error.status = 404;
    throw error;
  }
  return session;
}

/**
 * Ends an attendance session.
 *
 * @param {string} sessionId - The ID of the session to end.
 * @param {string} userId - The ID of the user ending the session.
 * @returns {Promise<object>} The updated session object.
 */
async function endSession(sessionId, userId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    const error = new Error('Session not found.');
    error.status = 404;
    throw error;
  }

  // Ensure the user ending the session is the one who created it
  if (session.teacherId.toString() !== userId) {
    const error = new Error('You are not authorized to end this session.');
    error.status = 403; // Forbidden
    throw error;
  }

  // Mark the session as inactive and set the end time to now
  session.isActive = false;
  await session.save();

  return session;
}

module.exports = {
  createSession,
  getSessionById,
  endSession,
};
