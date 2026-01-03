// server/services/session.service.js

const Session = require('../models/session.model');
const qrService = require('./qr.service');

/**
 * Creates a new attendance session.
 *
 * @param {object} sessionData - The session's data.
 * @param {string} userId - The ID of the user creating the session.
 * @returns {Promise<object>} The newly created session and QR code.
 */
async function createSession(sessionData, userId) {
  const { courseCode, courseName, duration } = sessionData;

  // Calculate start and end times
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + duration * 60000); // duration in minutes

  // The data to be encoded in the QR code
  const qrCodePayload = {
    courseCode,
    courseName,
    startTime,
    endTime
  };
  
  // Generate QR code
  const qrCodeData = await qrService.generateQRCode(JSON.stringify(qrCodePayload));
  
  // Create a new session object
  const newSession = new Session({
    courseCode,
    courseName,
    createdBy: userId,
    startTime,
    endTime,
    qrCodeData: qrCodeData,
  });

  await newSession.save();

  return { session: newSession, qrCode: qrCodeData };
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
  if (session.createdBy.toString() !== userId) {
    const error = new Error('You are not authorized to end this session.');
    error.status = 403; // Forbidden
    throw error;
  }

  // Mark the session as inactive and set the end time to now
  session.isActive = false;
  session.endTime = new Date();
  await session.save();

  return session;
}

module.exports = {
  createSession,
  getSessionById,
  endSession,
};


