// server/middlewares/validation.middleware.js

const { body, validationResult } = require('express-validator');

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

const validateRegistration = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Please provide a valid email.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('role').optional().isIn(['student', 'teacher']).withMessage('Invalid role.'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
};
