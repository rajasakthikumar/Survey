const rateLimit = require('express-rate-limit');
const CustomError = require('../utils/customError');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    handler: (req, res) => {
      throw new CustomError(message || 'Too many requests, please try again later', 429);
    }
  });
};

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many login attempts, please try again after 15 minutes'
);

const apiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100,
  'Too many requests, please try again after a minute'
);

module.exports = {
  authLimiter,
  apiLimiter
};