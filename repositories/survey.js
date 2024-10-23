const BaseRepository = require('./baseRepository');
const Survey = require('../models/survey');
const mongoose = require('mongoose');
class SurveyRepository extends BaseRepository {
  constructor() {
    super(Survey);
  }

  async findByIdWithQuestions(id) {
    return await this.model
      .findById(id)
      .populate({
        path: 'questions',
        options: { sort: { order: 1 } }
      });
  }

  async findAllWithQuestions(filter = {}) {
    return await this.model
      .find(filter)
      .populate({
        path: 'questions',
        options: { sort: { order: 1 } }
      });
  }
}

module.exports = SurveyRepository;