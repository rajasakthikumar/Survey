// services/surveyProgress.js
const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class SurveyProgressService extends BaseService {
  constructor(surveyProgressRepository, surveyService, questionService) {
    super(surveyProgressRepository);
    this.surveyService = surveyService;
    this.questionService = questionService;
  }

  async initializeProgress(surveyId, respondentId) {
    // Verify survey exists
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    // Check for existing progress
    let progress = await this.repository.findBySurveyAndRespondent(
      surveyId,
      respondentId
    );

    if (!progress) {
      progress = await this.create({
        surveyId,
        respondentId,
        status: 'NOT_STARTED',
        progress: 0,
        answeredQuestions: []
      });
    }

    return progress;
  }

  async updateProgress(surveyId, respondentId, questionId) {
    // Verify survey exists
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    // Verify question exists and belongs to the survey
    const question = await this.questionService.findById(questionId);
    if (!question || question.surveyId.toString() !== surveyId) {
      throw new CustomError('Question not found in this survey', 404);
    }

    // Get existing progress
    const progress = await this.repository.findBySurveyAndRespondent(
      surveyId,
      respondentId
    );

    if (!progress) {
      throw new CustomError('Survey progress not found, please initialize first', 404);
    }

    // Update progress status
    if (progress.status === 'NOT_STARTED') {
      progress.status = 'IN_PROGRESS';
    }

    // Add question to answered questions if not already present
    if (!progress.answeredQuestions.includes(questionId)) {
      progress.answeredQuestions.push(questionId);
    }

    // Calculate progress percentage
    progress.progress = (progress.answeredQuestions.length / survey.questions.length) * 100;

    // Check if survey is completed
    if (progress.progress === 100) {
      progress.status = 'COMPLETED';
    }

    await progress.save();
    return progress;
  }

  async getProgress(surveyId, respondentId) {
    // Verify survey exists
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    const progress = await this.repository.findBySurveyAndRespondent(
      surveyId,
      respondentId
    );

    if (!progress) {
      throw new CustomError('Survey progress not found', 404);
    }

    return progress;
  }

  async getSurveyParticipants(surveyId, requesterId) {
    // Verify survey exists and requester has permission
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    // Only survey creator or admin can view participants
    if (survey.createdBy.toString() !== requesterId && requesterId.role !== 'admin') {
      throw new CustomError('Not authorized to view participants', 403);
    }

    return await this.repository.findBySurveyWithRespondents(surveyId);
  }

  async getCompletionStats(surveyId, requesterId) {
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    // Only survey creator or admin can view stats
    if (survey.createdBy.toString() !== requesterId && requesterId.role !== 'admin') {
      throw new CustomError('Not authorized to view statistics', 403);
    }

    return await this.repository.getCompletionStats(surveyId);
  }

  async getRespondentProgress(respondentId) {
    return await this.repository.getRespondentProgress(respondentId);
  }
}

module.exports = SurveyProgressService;