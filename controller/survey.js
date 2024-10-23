const BaseController = require('./baseController');
const asyncHandler = require('../middleware/asyncHandler');
const formatResponse = require('../utils/formatResponse');

class SurveyController extends BaseController {
  constructor(surveyService) {
    super(surveyService);
  }

  getAllSurveys = asyncHandler(async (req, res) => {
    if (req.query.includeArchived !== 'true') {
      req.query.isArchived = false;
    }
    delete req.query.includeArchived;

    const surveys = await this.service.getAllSurveys(req.query);
    res.status(200).json(formatResponse(surveys));
  });

  createSurvey = asyncHandler(async (req, res) => {
    const survey = await this.service.createSurvey({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(formatResponse(survey));
  });

  duplicateSurvey = asyncHandler(async (req, res) => {
    const survey = await this.service.duplicateSurvey(
      req.params.id,
      req.user.id
    );
    res.status(201).json(formatResponse(survey));
  });

  archiveSurvey = asyncHandler(async (req, res) => {
    const survey = await this.service.archiveSurvey(
      req.params.id,
      req.user.id
    );
    res.status(200).json(formatResponse(survey));
  });

  unarchiveSurvey = asyncHandler(async (req, res) => {
    const survey = await this.service.unarchiveSurvey(
      req.params.id,
      req.user.id
    );
    res.status(200).json(formatResponse(survey));
  });

  reorderQuestions = asyncHandler(async (req, res) => {
    const survey = await this.service.reorderQuestions(
      req.params.id,
      req.body.questionOrder
    );
    res.status(200).json(formatResponse(survey));
  });
}

module.exports = SurveyController;