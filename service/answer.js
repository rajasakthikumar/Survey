// services/answer.js
const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class AnswerService extends BaseService {
  constructor(answerRepository, questionService, surveyService) {
    super(answerRepository);
    this.questionService = questionService;
    this.surveyService = surveyService;
  }

  async createAnswer(data) {
    const question = await this.questionService.findById(data.questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }

    await this.questionService.validateQuestionType(question._id, data.answerValue);

    // Check if answer already exists
    const existingAnswer = await this.repository.findOne({
      questionId: data.questionId,
      respondentId: data.respondentId
    });

    if (existingAnswer) {
      throw new CustomError('Answer already exists for this question', 400);
    }

    const answer = await this.create({
      ...data,
      surveyId: question.surveyId,
      isValid: true,
      validatedAt: new Date()
    });

    return answer;
  }

  async getAnswersBySurvey(surveyId, userId) {
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    // Only creator and admin can see all answers
    if (survey.createdBy.toString() !== userId && userId.role !== 'admin') {
      throw new CustomError('Not authorized to view all answers', 403);
    }

    return await this.repository.findBySurveyAndRespondent(surveyId);
  }

  async getAnswersByQuestion(questionId) {
    const question = await this.questionService.findById(questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }

    return await this.repository.findQuestionAnswers(questionId);
  }

  async getRespondentAnswers(surveyId, respondentId) {
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    return await this.repository.findBySurveyAndRespondent(surveyId, respondentId);
  }

  async getSurveyStats(surveyId) {
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    const answers = await this.repository.findAll({ surveyId });
    const questionStats = {};

    answers.forEach(answer => {
      if (!questionStats[answer.questionId]) {
        questionStats[answer.questionId] = {
          totalAnswers: 0,
          answerDistribution: {}
        };
      }

      questionStats[answer.questionId].totalAnswers++;

      const value = Array.isArray(answer.answerValue) ? 
        answer.answerValue.join(', ') : 
        answer.answerValue.toString();

      questionStats[answer.questionId].answerDistribution[value] = 
        (questionStats[answer.questionId].answerDistribution[value] || 0) + 1;
    });

    return questionStats;
  }

  async deleteAnswer(answerId, userId, userRole) {
    const answer = await this.findById(answerId);
    if (!answer) {
      throw new CustomError('Answer not found', 404);
    }

    // Only answer creator or admin can delete
    if (answer.respondentId.toString() !== userId && userRole !== 'admin') {
      throw new CustomError('Not authorized to delete this answer', 403);
    }

    return await this.deleteById(answerId);
  }
}

module.exports = AnswerService;