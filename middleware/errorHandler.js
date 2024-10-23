const CustomError = require('../utils/customError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (keys.nodeEnv === 'development') {
    console.error(err);
  }

  if (err.name === 'CastError') {
    error = new CustomError('Resource not found', 404);
  }

  if (err.code === 11000) {
    error = new CustomError('Duplicate field value entered', 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new CustomError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(keys.nodeEnv === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;