// server/middlewares/teacherAuth.middleware.js

const Teacher = require('../models/teacher.model');

/**
 * Teacher Authentication Middleware
 *
 * This middleware checks for a 'teacher-id' in the request headers.
 * It validates the ID against the Teacher collection in the database.
 *
 * - If the 'teacher-id' header is missing, it responds with a 401 Unauthorized error.
 * - If the 'teacher-id' is not found in the database, it responds with a 403 Forbidden error.
 * - If the 'teacher-id' is valid, it attaches the teacher document to `req.teacher` and passes
 *   control to the next middleware in the stack.
 */
const teacherAuth = async (req, res, next) => {
  const teacherId = req.headers['teacher-id'];

  // 1. Check if the 'teacher-id' header is present
  if (!teacherId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: teacher-id header is required.',
    });
  }

  try {
    // 2. Validate the teacherId against the database
    const teacher = await Teacher.findOne({ teacherId: teacherId });

    // 3. If teacher is not found, the ID is invalid
    if (!teacher) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid teacher-id.',
      });
    }

    // 4. Attach the teacher document to the request object
    req.teacher = teacher;

    // 5. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle potential database errors or other exceptions
    console.error('Error in teacher authentication middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = teacherAuth;
