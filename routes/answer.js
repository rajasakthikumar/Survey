const express = require('express');
const router = express.Router();
const { answerController } = require('../bootstrap');
const auth = require('../middleware/auth');
const { validateAnswer } = require('../middleware/validation');

router.use(auth);

router.post('/questions/:questionId',
  validateAnswer,
  answerController.submitAnswer
);

router.get('/surveys/:surveyId',
  answerController.getAnswersBySurvey
);

router.get('/surveys/:surveyId/my-answers',
  answerController.getMyAnswers
);

router.get('/questions/:questionId',
  answerController.getAnswersByQuestion
);

module.exports = router;