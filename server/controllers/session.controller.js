// server/controllers/session.controller.js

const sessionService = require('../services/session.service');

/**
 * Handles POST /api/session/
 * 
 * Creates a new attendance session.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function createSession(req, res, next) {
  try {
    const { courseCode, courseName, duration } = req.body;
    const userId = req.user.id;

    const { session, qrCode } = await sessionService.createSession({ courseCode, courseName, duration }, userId);

    res.status(201).json({
      success: true,
      message: 'Session created successfully.',
      data: {
        session,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles GET /api/session/:id
 * 
 * Retrieves a session by its ID.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function getSession(req, res, next) {
  try {
    const { id } = req.params;
    const session = await sessionService.getSessionById(id);

    res.status(200).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles PUT /api/session/:id/end
 * 
 * Ends an active attendance session.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 */
async function endSession(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await sessionService.endSession(id, userId);

    res.status(200).json({
      success: true,
      message: 'Session ended successfully.',
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSession,
  getSession,
  endSession,
};


