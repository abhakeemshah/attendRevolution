// server/controllers/session.controller.js

const sessionService = require('../services/session.service');

/**
 * Handles POST /api/v1/sessions
 *
 * Creates a new attendance session. This function is responsible for validating
 * the request body, invoking the session service to create the session, and
 * returning the session ID and QR token to the client.
 *
 * @param {Object} req - Express request object, containing the teacher's info and session details.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function for error handling.
 */
async function createSession(req, res, next) {
  try {
    // Extract session data from the request body.
    // The 'group' field is optional and will be undefined if not provided.
    const {
      semester,
      shift,
      class: className, // Renaming 'class' to 'className' to avoid keyword conflicts
      date,
      type,
      courseName,
      courseCode,
      timeFrom,
      timeTo,
      group,
    } = req.body;

    // The teacher's ID is attached to the request by the teacherAuth middleware.
    const teacherId = req.teacher._id;

    // The service layer handles the business logic of creating the session.
    const newSession = await sessionService.createSession(
      {
        semester,
        shift,
        class: className,
        date,
        type,
        courseName,
        courseCode,
        timeFrom,
        timeTo,
        group,
      },
      teacherId
    );

    // Respond with the essential details for the client.
    // The qrToken is used to generate the QR code on the frontend.
    res.status(201).json({
      success: true,
      message: 'Session created successfully.',
      data: {
        sessionId: newSession._id,
        qrToken: newSession.qrToken,
      },
    });
  } catch (error) {
    // Pass any errors to the global error handler.
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
    const userId = req.teacher._id;

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
