// repositories/survey.js
const BaseRepository = require('./baseRepository');
const Survey = require('../models/survey');

class SurveyRepository extends BaseRepository {
  constructor() {
    super(Survey);
  }

  async findByIdWithFullDetails(id) {
    try {
      const survey = await this.model.findById(id);
      if (!survey) {
        return null;
      }

      const populatedSurvey = await this.model
        .findById(id)
        .populate({
          path: 'questions',
          select: 'questionText responseType isMandatory order responseValues',
          options: { sort: { order: 1 } }
        })
        .populate({
          path: 'createdBy',
          select: 'username email'
        })
        .lean();

      return populatedSurvey;
    } catch (error) {
      console.error('Error in findByIdWithFullDetails:', error);
      throw error;
    }
  }

  async findAllWithQuestions(filter = {}) {
    const surveys = await this.model
      .find(filter)
      .populate({
        path: 'questions',
        select: 'questionText responseType isMandatory order responseValues',
        options: { sort: { order: 1 } }
      })
      .lean();

    return surveys;
  }

  async updateById(id, data) {
    return await this.model
      .findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      )
      .lean();
  }

  async create(data) {
    const survey = await this.model.create(data);
    return survey.toObject();
  }
}

module.exports = SurveyRepository;