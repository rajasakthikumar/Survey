// routes/surveyProgress.js
const express = require('express');
const router = express.Router();
const { surveyProgressController } = require('../bootstrap');
const auth = require('../middleware/auth');

router.use(auth);

// Initialize progress for a survey
router.post(
  '/surveys/:surveyId/initialize',
  surveyProgressController.initializeProgress
);

// Update progress after answering a question
router.put(
  '/surveys/:surveyId/questions/:questionId',
  surveyProgressController.updateProgress
);

// Get progress for a specific survey
router.get(
  '/surveys/:surveyId',
  surveyProgressController.getProgress
);

// Get all participants for a survey
router.get(
  '/surveys/:surveyId/participants',
  surveyProgressController.getParticipants
);

// Get completion statistics for a survey
router.get(
  '/surveys/:surveyId/stats',
  surveyProgressController.getCompletionStats
);

// Get current user's progress across all surveys
router.get(
  '/my-progress',
  surveyProgressController.getMyProgress
);

module.exports = router;