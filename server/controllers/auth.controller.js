// server/controllers/auth.controller.js

const authService = require('../services/auth.service');

/**
 * Handles user registration.
 * 
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.register({ name, email, password, role });
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please wait for admin approval.',
      data: { userId: user._id },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles user login.
 * 
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
