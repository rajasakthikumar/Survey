const BaseRepository = require('./baseRepository');
const Survey = require('../models/survey');

class SurveyRepository extends BaseRepository {
  constructor() {
    super(Survey);
  }

  async findByIdWithQuestions(id) {
    return await this.model
      .findById(id)
      .populate({
        path: 'questions',
        populate: {
          path: 'responseValues'
        }
      });
  }

  async findAllWithQuestions(filter = {}) {
    return await this.model
      .find(filter)
      .populate({
        path: 'questions',
        populate: {
          path: 'responseValues'
        }
      });
  }
}

module.exports = SurveyRepository;