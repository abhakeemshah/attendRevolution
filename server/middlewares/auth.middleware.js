// server/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

/**
 * Protects routes by verifying JWT.
 * Attaches user to the request object.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized, user not found' } });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized, token failed' } });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authorized, no token' } });
  }
};

/**
 * Authorizes routes based on user role.
 *
 * @param {...string} roles - The roles that are allowed to access the route.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `User role ${req.user ? req.user.role : 'none'} is not authorized to access this route`,
        },
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
