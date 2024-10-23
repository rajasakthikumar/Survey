require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const keys = require('./config/keys');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Routes
const userRoutes = require('./routes/user');
const surveyRoutes = require('./routes/survey');
const questionRoutes = require('./routes/question');
const answerRoutes = require('./routes/answer');
const surveyProgressRoutes = require('./routes/surveyProgress');

app.use('/api/users', userRoutes);
app.use('/api/surveys', authMiddleware, surveyRoutes);
app.use('/api/questions', authMiddleware, questionRoutes);
app.use('/api/answers', authMiddleware, answerRoutes);
app.use('/api/survey-progress', authMiddleware, surveyProgressRoutes);

// Error Handler
app.use(errorHandler);

const PORT = keys.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));