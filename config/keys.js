require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/survey',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  port: process.env.PORT || 5000,
  // nodeEnv: process.env.NODE_ENV || 'development'
};