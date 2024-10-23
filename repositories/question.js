const BaseRepository = require('./baseRepository');
const Question = require('../models/question');

class QuestionRepository extends BaseRepository {
  constructor() {
    super(Question);
  }

  async findBySurveyId(surveyId) {
    return await this.model
      .find({ surveyId })
      .sort('order');
  }

  async getMaxOrder(surveyId) {
    const result = await this.model
      .findOne({ surveyId })
      .sort('-order')
      .select('order');
    return result ? result.order : 0;
  }

  async reorderQuestions(surveyId, questionOrder) {
    const bulkOps = questionOrder.map((questionId, index) => ({
      updateOne: {
        filter: { _id: questionId, surveyId },
        update: { $set: { order: index } }
      }
    }));

    return await this.model.bulkWrite(bulkOps);
  }
}

module.exports = QuestionRepository;