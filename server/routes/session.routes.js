// server/routes/session.routes.js

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const teacherAuth = require('../middlewares/teacherAuth.middleware');
const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors from express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data.',
        errors: errors.array(),
      },
    });
  }
  next();
};

// Validation rules for session creation
const validateSessionCreation = [
  body('semester').isNumeric().withMessage('Semester must be a number.'),
  body('shift').notEmpty().withMessage('Shift is required.'),
  body('class').notEmpty().withMessage('Class is required.'),
  body('date').isISO8601().toDate().withMessage('Invalid date format.'),
  body('type').isIn(['theory', 'practical']).withMessage('Type must be either "theory" or "practical".'),
  body('courseName').notEmpty().withMessage('Course name is required.'),
  body('courseCode').notEmpty().withMessage('Course code is required.'),
  body('timeFrom').notEmpty().withMessage('Start time is required.'),
  body('timeTo').notEmpty().withMessage('End time is required.'),
  // 'group' is optional and doesn't require validation unless specific rules apply
  handleValidationErrors,
];

/**
 * @route   POST /api/v1/sessions
 * @desc    Create a new session
 * @access  Private (Teacher only)
 */
router.post('/', teacherAuth, validateSessionCreation, sessionController.createSession);

/**
 * @route   GET /api/v1/sessions/:id
 * @desc    Get session by ID
 * @access  Public (for students to get session details for scanning)
 */
router.get('/:id', sessionController.getSession);

/**
 * @route   PUT /api/v1/sessions/:id/end
 * @desc    End a session
 * @access  Private (Teacher only)
 */
router.put('/:id/end', teacherAuth, sessionController.endSession);

module.exports = router;
