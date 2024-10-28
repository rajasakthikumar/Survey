const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class AnswerService extends BaseService {
  constructor(answerRepository, questionService, surveyService, surveyProgressService) {
    super(answerRepository);
    this.questionService = questionService;
    this.surveyService = surveyService;
    this.surveyProgressService = surveyProgressService; 
  }

  async createAnswer(data) {
    try {
      const question = await this.questionService.getQuestionById(data.questionId);
      if (!question) {
        throw new CustomError('Question not found', 404);
      }

      await this.validateAnswer(question, data.answerValue);

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

      await this.updateSurveyProgress(
        question.surveyId,
        data.respondentId,
        question._id
      );

      return answer;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error creating answer', 500);
    }
  }

  async updateSurveyProgress(surveyId, respondentId, questionId) {
    try {
      let progress = await this.surveyProgressService.findBySurveyAndRespondent(
        surveyId,
        respondentId
      );

      if (!progress) {
        progress = await this.surveyProgressService.initializeProgress(
          surveyId,
          respondentId
        );
      }

      await this.surveyProgressService.updateProgress(
        surveyId,
        respondentId,
        questionId
      );

    } catch (error) {
      throw new CustomError('Error updating survey progress', 500);
    }
  }

  async validateAnswer(question, answerValue) {
    switch (question.responseType) {
      case 'text':
        if (typeof answerValue !== 'string') {
          throw new CustomError('Answer must be a text value', 400);
        }
        break;

      case 'multiple-choice':
        if (!Array.isArray(answerValue)) {
          throw new CustomError('Answer must be an array for multiple-choice questions', 400);
        }
        if (!question.allowMultiple && answerValue.length > 1) {
          throw new CustomError('Multiple selections not allowed for this question', 400);
        }
        const validValues = question.responseValues.map(rv => rv.value);
        const invalidValues = answerValue.filter(v => !validValues.includes(v));
        if (invalidValues.length > 0) {
          throw new CustomError(`Invalid options selected: ${invalidValues.join(', ')}`, 400);
        }
        break;

      case 'single-choice':
        if (Array.isArray(answerValue)) {
          throw new CustomError('Single choice question cannot have multiple answers', 400);
        }
        if (!question.responseValues.some(rv => rv.value === answerValue)) {
          throw new CustomError('Invalid option selected', 400);
        }
        break;

      case 'rating':
        const rating = Number(answerValue);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          throw new CustomError('Rating must be a number between 1 and 5', 400);
        }
        break;

      case 'boolean':
        if (typeof answerValue !== 'boolean') {
          throw new CustomError('Answer must be true or false', 400);
        }
        break;

      default:
        throw new CustomError('Invalid question type', 400);
    }

    return true;
  }

  async getAnswersBySurvey(surveyId, userId) {
    try {
      const survey = await this.surveyService.getSurveyById(surveyId);
      if (!survey) {
        throw new CustomError('Survey not found', 404);
      }

      if (survey.createdBy.toString() !== userId && userId.role !== 'admin') {
        throw new CustomError('Not authorized to view all answers', 403);
      }

      return await this.repository.findBySurveyAndRespondent(surveyId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error retrieving answers', 500);
    }
  }

  async getAnswersByQuestion(questionId) {
    try {
      const question = await this.questionService.getQuestionById(questionId);
      if (!question) {
        throw new CustomError('Question not found', 404);
      }

      return await this.repository.findQuestionAnswers(questionId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error retrieving answers', 500);
    }
  }

  async getRespondentAnswers(surveyId, respondentId) {
    try {
      const survey = await this.surveyService.getSurveyById(surveyId);
      if (!survey) {
        throw new CustomError('Survey not found', 404);
      }

      return await this.repository.findBySurveyAndRespondent(surveyId, respondentId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error retrieving answers', 500);
    }
  }

  async getSurveyStats(surveyId) {
    try {
      const survey = await this.surveyService.getSurveyById(surveyId);
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

        const value = Array.isArray(answer.answerValue) 
          ? answer.answerValue.join(', ') 
          : answer.answerValue.toString();

        questionStats[answer.questionId].answerDistribution[value] = 
          (questionStats[answer.questionId].answerDistribution[value] || 0) + 1;
      });

      return questionStats;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error getting survey statistics', 500);
    }
  }

  async deleteAnswer(answerId, userId, userRole) {
    try {
      const answer = await this.findById(answerId);
      if (!answer) {
        throw new CustomError('Answer not found', 404);
      }

      // Only answer creator or admin can delete
      if (answer.respondentId.toString() !== userId && userRole !== 'admin') {
        throw new CustomError('Not authorized to delete this answer', 403);
      }

      return await this.deleteById(answerId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error deleting answer', 500);
    }
  }
}

module.exports = AnswerService;