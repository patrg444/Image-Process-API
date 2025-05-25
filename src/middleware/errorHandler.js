const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Set default error status if not already set
  const status = err.status || 500;
  
  // Prepare error response
  const errorResponse = {
    error: {
      message: err.message || 'Internal Server Error',
      status: status,
      timestamp: new Date().toISOString()
    }
  };

  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.error.message = 'Validation Error';
    errorResponse.error.details = err.details || err.message;
    return res.status(400).json(errorResponse);
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      errorResponse.error.message = 'File too large. Maximum size is 10MB.';
      return res.status(400).json(errorResponse);
    }
    errorResponse.error.message = 'File upload error';
    return res.status(400).json(errorResponse);
  }

  if (err.code === 'ENOENT') {
    errorResponse.error.message = 'File not found';
    return res.status(404).json(errorResponse);
  }

  // Send error response
  res.status(status).json(errorResponse);
};

module.exports = errorHandler;
