const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    keys.jwtSecret,
    { expiresIn: '1d' }
  );
};

module.exports = generateToken;