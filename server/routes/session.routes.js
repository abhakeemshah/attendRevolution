// server/routes/session.routes.js

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

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
    body('duration').isNumeric().withMessage('Duration must be a number.'),
    handleValidationErrors,
];


/**
 * @route   POST /api/session
 * @desc    Create a new session
 * @access  Private (Teacher only)
 */
router.post('/', protect, authorize('teacher'), validateSessionCreation, sessionController.createSession);

/**
 * @route   GET /api/session/:id
 * @desc    Get session by ID
 * @access  Private (Teacher or Student)
 */
router.get('/:id', protect, sessionController.getSession);

/**
 * @route   PUT /api/session/:id/end
 * @desc    End a session
 * @access  Private (Teacher only)
 */
router.put('/:id/end', protect, authorize('teacher'), sessionController.endSession);

module.exports = router;


