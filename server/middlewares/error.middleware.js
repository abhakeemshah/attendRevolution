// server/middlewares/error.middleware.js

const config = require('../config/config');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const response = {
    success: false,
    error: {
      code,
      message: err.message || 'An unexpected error occurred'
    }
  };

  if (config.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
