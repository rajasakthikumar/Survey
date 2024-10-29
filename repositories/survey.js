const BaseRepository = require('./baseRepository');
const Survey = require('../models/survey');

class SurveyRepository extends BaseRepository {
  constructor() {
    super(Survey);
  }

  async findByIdWithFullDetails(id) {
    const survey = await this.model
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

    return survey;
  }

  async findAllWithQuestions(filter = {}) {
    const surveys = await this.model
      .find(filter)
      .populate({
        path: 'questions',
        select: 'questionText responseType isMandatory order responseValues',
        options: { sort: { order: 1 } }
      })
      .sort('-createdAt')
      .lean(); 
    return surveys.map(survey => ({
      id: survey._id,
      title: survey.title,
      description: survey.description,
      isTemplate: survey.isTemplate,
      isArchived: survey.isArchived,
      questions: survey.questions || [],
      questionOrder: survey.questionOrder || [],
      createdBy: survey.createdBy,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      isActive: survey.isActive
    }));
  }

  async updateById(id, data) {
    const survey = await this.model
      .findByIdAndUpdate(
        id,
        data,
        { 
          new: true, 
          runValidators: true 
        }
      )
      .populate({
        path: 'questions',
        select: 'questionText responseType isMandatory order responseValues',
        options: { sort: { order: 1 } }
      })
      .lean(); 

    return survey;
  }

  async create(data) {
    const survey = await this.model.create(data);
    return survey.toObject(); 
  }
}

module.exports = SurveyRepository;