const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class SurveyService extends BaseService {
  constructor(surveyRepository) {
    super(surveyRepository);
    this._questionService = null;
  }

  setQuestionService(questionService) {
    this._questionService = questionService;
  }

  async createSurvey(data) {
    const survey = await this.create({
      ...data,
      questions: [],
      questionOrder: []
    });
    return survey;
  }

  async getSurveyById(id) {
    const survey = await this.repository.findByIdWithQuestions(id);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }
    return survey;
  }

  async getAllSurveys(filter = {}) {
    return await this.repository.findAllWithQuestions(filter);
  }

  async addQuestionToSurvey(surveyId, questionId) {
    const survey = await this.findById(surveyId);
    if (!survey.questions.includes(questionId)) {
      survey.questions.push(questionId);
      survey.questionOrder.push(questionId);
      await survey.save();
    }
    return survey;
  }

  async reorderQuestions(surveyId, questionOrder) {
    const survey = await this.findById(surveyId);
    const currentQuestions = new Set(survey.questions.map(q => q.toString()));
    
    if (!questionOrder.every(id => currentQuestions.has(id.toString()))) {
      throw new CustomError('Invalid question order provided', 400);
    }

    survey.questionOrder = questionOrder;
    await survey.save();
    return survey;
  }

  async archiveSurvey(id, userId) {
    const survey = await this.updateById(id, {
      isArchived: true,
      archivedAt: new Date(),
      modifiedBy: userId
    });
    return survey;
  }

  async unarchiveSurvey(id, userId) {
    const survey = await this.updateById(id, {
      isArchived: false,
      archivedAt: null,
      modifiedBy: userId
    });
    return survey;
  }

  async duplicateSurvey(id, userId) {
    const originalSurvey = await this.getSurveyById(id);
    const surveyData = {
      title: `${originalSurvey.title} (Copy)`,
      description: originalSurvey.description,
      isTemplate: originalSurvey.isTemplate,
      createdBy: userId
    };

    const newSurvey = await this.createSurvey(surveyData);

    for (const question of originalSurvey.questions) {
      const newQuestion = await this._questionService.duplicateQuestion(
        question._id,
        newSurvey._id,
        userId
      );
      await this.addQuestionToSurvey(newSurvey._id, newQuestion._id);
    }

    return await this.getSurveyById(newSurvey._id);
  }
}

module.exports = SurveyService;