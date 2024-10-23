
const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class AnswerService extends BaseService {
  constructor(answerRepository) {
    super(answerRepository);
  }

  async createAnswer(data) {
    const answer = await this.create(data);
    return answer;
  }

  async getAnswersBySurvey(surveyId) {
    const answers = await this.findAll({ surveyId });
    return answers;
  }

  async getAnswersByQuestion(questionId) {
    const answers = await this.findAll({ questionId });
    return answers;
  }
}

module.exports = AnswerService;
