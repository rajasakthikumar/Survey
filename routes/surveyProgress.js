const express = require('express');
const router = express.Router();
const { surveyProgressController } = require('../bootstrap');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/surveys/:surveyId/initialize',
  surveyProgressController.initializeProgress
);

router.get('/surveys/:surveyId',
  surveyProgressController.getProgress
);

router.get('/surveys/:surveyId/participants',
  surveyProgressController.getParticipants
);

module.exports = router;