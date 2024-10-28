const BaseController = require('./baseController');
const asyncHandler = require('../middleware/asyncHandler');
const formatResponse = require('../utils/formatResponse');

class QuestionController extends BaseController {
  constructor(questionService) {
    super(questionService);
  }

  createQuestion = asyncHandler(async (req, res) => {
    console.log('@!@!@!@!@ Control reaches here');
    const question = await this.service.createQuestion({
      ...req.body,
    //   surveyId: req.params.surveyId,
      createdBy: req.user.id
    });
    res.status(201).json(formatResponse(question));
  });

  updateQuestion = asyncHandler(async (req, res) => {
    const question = await this.service.updateQuestion(req.params.id, {
      ...req.body,
      modifiedBy: req.user.id
    });
    res.status(200).json(formatResponse(question));
  });

  moveQuestion = asyncHandler(async (req, res) => {
    const { direction } = req.body;
    const question = await this.service.moveQuestion(
      req.params.surveyId,
      req.params.id,
      direction
    );
    res.status(200).json(formatResponse(question));
  });
}

module.exports = QuestionController;