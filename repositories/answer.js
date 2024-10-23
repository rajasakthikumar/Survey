const BaseRepository = require('./baseRepository');
const Answer = require('../models/answer');

class AnswerRepository extends BaseRepository {
  constructor() {
    super(Answer);
  }

  async findBySurveyAndRespondent(surveyId, respondentId) {
    return await this.model
      .find({ surveyId, respondentId })
      .populate('questionId');
  }

  async findQuestionAnswers(questionId) {
    return await this.model
      .find({ questionId })
      .populate('respondentId', 'username email');
  }
}

module.exports = AnswerRepository;