const BaseController = require('./baseController');
const asyncHandler = require('../middleware/asyncHandler');
const formatResponse = require('../utils/formatResponse');

class SurveyProgressController extends BaseController {
  constructor(surveyProgressService) {
    super(surveyProgressService);
  }

  initializeProgress = asyncHandler(async (req, res) => {
    const progress = await this.service.initializeProgress(
      req.params.surveyId,
      req.user.id
    );
    res.status(200).json(formatResponse(progress));
  });

  updateProgress = asyncHandler(async (req, res) => {
    const progress = await this.service.updateProgress(
      req.params.surveyId,
      req.user.id,
      req.params.questionId
    );
    res.status(200).json(formatResponse(progress));
  });

  getProgress = asyncHandler(async (req, res) => {
    const progress = await this.service.getProgress(
      req.params.surveyId,
      req.user.id
    );
    res.status(200).json(formatResponse(progress));
  });

  getParticipants = asyncHandler(async (req, res) => {
    const participants = await this.service.getSurveyParticipants(
      req.params.surveyId,
      req.user.id
    );
    res.status(200).json(formatResponse(participants));
  });

  getCompletionStats = asyncHandler(async (req, res) => {
    const stats = await this.service.getCompletionStats(
      req.params.surveyId,
      req.user.id
    );
    res.status(200).json(formatResponse(stats));
  });

  getMyProgress = asyncHandler(async (req, res) => {
    const progress = await this.service.getRespondentProgress(req.user.id);
    res.status(200).json(formatResponse(progress));
  });
}

module.exports = SurveyProgressController;