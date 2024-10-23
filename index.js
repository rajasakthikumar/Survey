const express = require('express');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

mongoose
  .connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));

const userRoutes = require('./routes/user');
const surveyRoutes = require('./routes/survey');
const questionRoutes = require('./routes/question');
const answerRoutes = require('./routes/answer');

app.use('/api/users', userRoutes);
app.use('/api/surveys', authMiddleware, surveyRoutes);
app.use('/api/questions', authMiddleware, questionRoutes);
app.use('/api/answers', authMiddleware, answerRoutes);

app.use(errorHandler);

const PORT = keys.port;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/survey',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development'
};