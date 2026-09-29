const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode) || 500;
  const message = err.message || 'An internal server error occurred.';

  // Structured response format required by project specs
  const response = {
    success: false,
    message
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  // Include stack trace only in local development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
