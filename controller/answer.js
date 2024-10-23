const BaseController = require('./baseController');
const asyncHandler = require('../middleware/asyncHandler');
const formatResponse = require('../utils/formatResponse');

class AnswerController extends BaseController {
  constructor(answerService) {
    super(answerService);
  }

  submitAnswer = asyncHandler(async (req, res) => {
    const answer = await this.service.createAnswer({
      ...req.body,
      questionId: req.params.questionId,
      respondentId: req.user.id,
      createdBy: req.user.id
    });
    res.status(201).json(formatResponse(answer));
  });

  getAnswersBySurvey = asyncHandler(async (req, res) => {
    const answers = await this.service.getAnswersBySurvey(req.params.surveyId);
    res.status(200).json(formatResponse(answers));
  });

  getAnswersByQuestion = asyncHandler(async (req, res) => {
    const answers = await this.service.getAnswersByQuestion(req.params.questionId);
    res.status(200).json(formatResponse(answers));
  });

  getMyAnswers = asyncHandler(async (req, res) => {
    const answers = await this.service.getRespondentAnswers(
      req.params.surveyId,
      req.user.id
    );
    res.status(200).json(formatResponse(answers));
  });
}

module.exports = AnswerController;