const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class QuestionService extends BaseService {
  constructor(questionRepository, responseValueService, surveyService) {
    super(questionRepository);
    this.responseValueService = responseValueService;
    this.surveyService = surveyService;
  }

  async createQuestion(data) {
    const question = await this.create(data);
    const questionID = question._id;

    await this.surveyService.addQuestionToSurvey(question.surveyId, questionID);

    if (data.responseValues && data.responseValues.length > 0) {
      for (const value of data.responseValues) {
        const responseValueObject = {
          questionId: questionID,
          responseValue: value,
        };
        await this.responseValueService.createResponseValue(responseValueObject);
      }
    }

    return question;
  }

  async getQuestionById(questionId) {
    const question = await this.findById(questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }

    const responseValues = await this.responseValueService.findAll({ questionId: question._id });
    question.responseValues = responseValues;

    return question;
  }

  async updateQuestion(questionId, data) {
    const question = await this.updateById(questionId, data);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }
    return question;
  }

  async deleteQuestion(questionId) {
    const question = await this.findById(questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }

    await this.surveyService.removeQuestionFromSurvey(question.surveyId, questionId);

    await this.responseValueService.deleteMany({ questionId });

    await this.deleteById(questionId);

    return question;
  }

  async deleteQuestionsBySurveyId(surveyId) {
    const questions = await this.findAll({ surveyId });
    for (const question of questions) {
      await this.deleteQuestion(question._id);
    }
  }

  async moveQuestion(surveyId, questionId, direction) {
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    const index = survey.questionOrder.findIndex((id) => id.toString() === questionId);
    if (index === -1) {
      throw new CustomError('Question not found in survey', 404);
    }

    if (direction === 'up' && index > 0) {
      [survey.questionOrder[index - 1], survey.questionOrder[index]] = [
        survey.questionOrder[index],
        survey.questionOrder[index - 1],
      ];
    } else if (direction === 'down' && index < survey.questionOrder.length - 1) {
      [survey.questionOrder[index], survey.questionOrder[index + 1]] = [
        survey.questionOrder[index + 1],
        survey.questionOrder[index],
      ];
    } else {
      throw new CustomError('Cannot move question in that direction', 400);
    }

    await this.surveyService.updateSurvey(surveyId, { questionOrder: survey.questionOrder });

    return survey;
  }

  
}

module.exports = QuestionService;
