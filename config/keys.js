const jwtSecret = process.env.JWT_SECRET || 'secret';
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/survey';

module.exports = {
  jwtSecret,
  mongoURI,
};
