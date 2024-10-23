// routes/answer.js
const express = require('express');
const router = express.Router();
const { answerController } = require('../bootstrap');
const auth = require('../middleware/auth');
const { validateAnswer } = require('../middleware/validation');

router.use(auth); // Apply auth middleware to all routes

// Submit an answer for a question
router.post(
  '/questions/:questionId',
  validateAnswer,
  answerController.submitAnswer
);

// Get all answers for a survey
router.get(
  '/surveys/:surveyId',
  answerController.getAnswersBySurvey
);

// Get current user's answers for a survey
router.get(
  '/surveys/:surveyId/my-answers',
  answerController.getMyAnswers
);

// Get all answers for a specific question
router.get(
  '/questions/:questionId',
  answerController.getAnswersByQuestion
);

// Get answer statistics for a survey
router.get(
  '/surveys/:surveyId/stats',
  answerController.getSurveyStats
);

// Delete an answer (only by answer creator or admin)
router.delete(
  '/:answerId',
  answerController.deleteAnswer
);

module.exports = router;