const jwt = require('jsonwebtoken');
const CustomError = require('../utils/customError');
const keys = require('../config/keys');
const User = require('../models/user');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new CustomError('Not authorized to access this route', 401);
    }

    const decoded = jwt.verify(token, keys.jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new CustomError('User not found', 404);
    }

    next();
  } catch (err) {
    next(new CustomError('Authentication failed', 401));
  }
};

module.exports = protect;