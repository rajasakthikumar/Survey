const express = require('express');
const router = express.Router();
const { surveyController } = require('../bootstrap');
const auth = require('../middleware/auth');
const { 
  validateSurvey, 
  validateSurveyUpdate, 
  validateReorderQuestions 
} = require('../middleware/validation');
const checkOwnership = require('../middleware/checkOwnership');

router.use(auth);

router.route('/')
  .get(surveyController.getAllSurveys)
  .post(validateSurvey, surveyController.createSurvey);

router.route('/:id')
  .get(surveyController.getById)
  .put(checkOwnership('Survey'), validateSurveyUpdate, surveyController.update)
  .delete(checkOwnership('Survey'), surveyController.delete);

router.post('/:id/duplicate', surveyController.duplicateSurvey);
router.put('/:id/archive', checkOwnership('Survey'), surveyController.archiveSurvey);
router.put('/:id/unarchive', checkOwnership('Survey'), surveyController.unarchiveSurvey);
router.put('/:id/reorder-questions', 
  checkOwnership('Survey'), 
  validateReorderQuestions, 
  surveyController.reorderQuestions
);

module.exports = router;