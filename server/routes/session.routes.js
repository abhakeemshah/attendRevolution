// server/routes/session.routes.js

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const teacherAuth = require('../middlewares/teacherAuth.middleware'); // Import the new middleware
const { body } = require('express-validator');

// Note: The old 'protect' and 'authorize' middlewares are replaced by 'teacherAuth'.
// The validation logic remains unchanged.

const handleValidationErrors = (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
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

const validateSessionCreation = [
    body('courseCode').notEmpty().withMessage('Course code is required.'),
    body('courseName').notEmpty().withMessage('Course name is required.'),
    // Note: The 'duration' validation might need to be updated to match the new model (timeFrom, timeTo)
    // but the instruction is to not change controller logic, so we leave it for now.
    handleValidationErrors,
];


/**
 * @route   POST /api/session
 * @desc    Create a new session
 * @access  Private (Teacher only)
 */
router.post('/', teacherAuth, validateSessionCreation, sessionController.createSession);

/**
 * @route   GET /api/session/:id
 * @desc    Get session by ID
 * @access  Public (for students to get session details for scanning)
 */
// This route is intentionally left without teacherAuth to allow students to fetch session details.
// The old 'protect' middleware is removed to make it public as per requirements.
router.get('/:id', sessionController.getSession);

/**
 * @route   PUT /api/session/:id/end
 * @desc    End a session
 * @access  Private (Teacher only)
 */
router.put('/:id/end', teacherAuth, sessionController.endSession);

module.exports = router;
