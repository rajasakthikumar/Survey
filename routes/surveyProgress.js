// routes/surveyProgress.js
const express = require('express');
const router = express.Router();
const { surveyProgressController } = require('../bootstrap');
const auth = require('../middleware/auth');

router.use(auth);

router.post(
  '/surveys/:surveyId/initialize',
  surveyProgressController.initializeProgress
);

router.put(
  '/surveys/:surveyId/questions/:questionId',
  surveyProgressController.updateProgress
);

router.get(
  '/surveys/:surveyId',
  surveyProgressController.getProgress
);

router.get(
  '/surveys/:surveyId/participants',
  surveyProgressController.getParticipants
);

router.get(
  '/surveys/:surveyId/stats',
  surveyProgressController.getCompletionStats
);

router.get(
  '/my-progress',
  surveyProgressController.getMyProgress
);

module.exports = router;