const express = require('express');
const router = express.Router();
const { questionController } = require('../bootstrap');
const auth = require('../middleware/auth');
const { 
  validateQuestion, 
  validateQuestionUpdate 
} = require('../middleware/validation');
const checkOwnership = require('../middleware/checkOwnership');

router.use(auth);

router.route('/')
  .post(validateQuestion, questionController.createQuestion);

router.route('/:id')
  .get(questionController.getById)
  .put(checkOwnership('Question'), validateQuestionUpdate, questionController.updateQuestion)
  .delete(checkOwnership('Question'), questionController.delete);

router.put('/:id/move', 
  checkOwnership('Question'), 
  questionController.moveQuestion
);

module.exports = router;