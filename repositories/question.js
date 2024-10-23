const BaseRepository = require('./baseRepository');
const Question = require('../models/question');

class QuestionRepository extends BaseRepository {
  constructor() {
    super(Question);
  }

  async findBySurveyId(surveyId) {
    return await this.model
      .find({ surveyId })
      .sort('order')
      .populate('responseValues');
  }

  async getMaxOrder(surveyId) {
    const result = await this.model
      .findOne({ surveyId })
      .sort('-order')
      .select('order');
    return result ? result.order : 0;
  }
}

module.exports = QuestionRepository;