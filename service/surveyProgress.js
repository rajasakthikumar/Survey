const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class SurveyProgressService extends BaseService {
  constructor(surveyProgressRepository, surveyService) {
    super(surveyProgressRepository);
    this.surveyService = surveyService;
  }

  async initializeProgress(surveyId, respondentId) {
    await this.surveyService.findById(surveyId);

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
    const survey = await this.surveyService.getSurveyById(surveyId);
    const progress = await this.repository.findBySurveyAndRespondent(
      surveyId,
      respondentId
    );

    if (!progress) {
      throw new CustomError('Survey progress not found', 404);
    }

    // Update progress status
    if (progress.status === 'NOT_STARTED') {
      progress.status = 'IN_PROGRESS';
      progress.startedAt = new Date();
    }

    // Update answered questions
    if (!progress.answeredQuestions.includes(questionId)) {
      progress.answeredQuestions.push(questionId);
    }

    // Calculate progress percentage
    progress.progress = (progress.answeredQuestions.length / survey.questions.length) * 100;
    progress.lastAnsweredAt = new Date();

    // Check if survey is completed
    if (progress.progress === 100) {
      progress.status = 'COMPLETED';
      progress.completedAt = new Date();
    }

    await progress.save();
    return progress;
  }

  async getProgress(surveyId, respondentId) {
    const progress = await this.repository.findBySurveyAndRespondent(
      surveyId,
      respondentId
    );
    if (!progress) {
      throw new CustomError('Survey progress not found', 404);
    }
    return progress;
  }

  async getSurveyParticipants(surveyId) {
    return await this.repository.findBySurveyWithRespondents(surveyId);
  }
}

module.exports = SurveyProgressService;