/**
 * Session Model
 * 
 * This module handles data persistence for attendance sessions.
 * It abstracts file operations so services don't need to know about storage details.
 * 
 * Why separate model layer:
 * - Services focus on business logic, not storage details
 * - Easy to switch from JSON to MongoDB later
 * - Centralized data access patterns
 * - Consistent error handling
 */

const fileUtil = require('../utils/file.util');
const config = require('../config/config');

/**
 * Retrieves all sessions from storage
 * 
 * This loads the entire sessions array from the JSON file.
 * For MVP, this is fine. In production with MongoDB, we'd use queries instead.
 * 
 * @returns {Promise<Array>} Array of session objects
 */
async function getAllSessions() {
  try {
    const sessions = await fileUtil.readJSONFile(config.storage.sessionsFile);
    return sessions;
  } catch (error) {
    // Log error but don't expose internal details to caller
    console.error('Error reading sessions:', error.message);
    throw new Error('Failed to retrieve sessions from storage');
  }
}

/**
 * Retrieves a single session by its ID
 * 
 * This searches through all sessions to find a match.
 * In production with MongoDB, this would be a direct database query.
 * 
 * @param {string} sessionId - UUID of the session to find
 * @returns {Promise<Object|null>} Session object if found, null otherwise
 */
async function getSessionById(sessionId) {
  try {
    const sessions = await getAllSessions();
    const session = sessions.find(s => s.sessionId === sessionId);
    return session || null;
  } catch (error) {
    console.error('Error finding session:', error.message);
    throw new Error('Failed to retrieve session from storage');
  }
}

/**
 * Retrieves all active sessions
 * 
 * Active sessions are those that haven't expired and haven't been manually ended.
 * This is used to show teachers what sessions are currently running.
 * 
 * @returns {Promise<Array>} Array of active session objects
 */
async function getActiveSessions() {
  try {
    const sessions = await getAllSessions();
    // Filter for sessions that are marked as active
    // Note: We also check expiry in the service layer for accuracy
    return sessions.filter(session => session.isActive === true);
  } catch (error) {
    console.error('Error finding active sessions:', error.message);
    throw new Error('Failed to retrieve active sessions from storage');
  }
}

/**
 * Saves a new session to storage
 * 
 * This adds a session to the array and persists it to the JSON file.
 * We append to the array to maintain chronological order.
 * 
 * @param {Object} sessionData - Session object to save
 * @returns {Promise<Object>} The saved session object
 */
async function createSession(sessionData) {
  try {
    const sessions = await getAllSessions();
    
    // Add the new session to the array
    sessions.push(sessionData);
    
    // Write the updated array back to the file
    await fileUtil.writeJSONFile(config.storage.sessionsFile, sessions);
    
    return sessionData;
  } catch (error) {
    console.error('Error creating session:', error.message);
    throw new Error('Failed to save session to storage');
  }
}

/**
 * Updates an existing session
 * 
 * This finds a session by ID and updates its properties.
 * Used when ending a session or updating its status.
 * 
 * @param {string} sessionId - UUID of the session to update
 * @param {Object} updateData - Object containing fields to update
 * @returns {Promise<Object|null>} Updated session object if found, null otherwise
 */
async function updateSession(sessionId, updateData) {
  try {
    const sessions = await getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId);
    
    // Return null if session not found
    if (sessionIndex === -1) {
      return null;
    }
    
    // Update the session with new data
    // We merge the update data with existing session data
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updateData
    };
    
    // Persist the changes
    await fileUtil.writeJSONFile(config.storage.sessionsFile, sessions);
    
    return sessions[sessionIndex];
  } catch (error) {
    console.error('Error updating session:', error.message);
    throw new Error('Failed to update session in storage');
  }
}

module.exports = {
  getAllSessions,
  getSessionById,
  getActiveSessions,
  createSession,
  updateSession
};

