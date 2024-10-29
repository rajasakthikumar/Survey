const BaseRepository = require('./baseRepository');
const SurveyProgress = require('../models/surveyProgress');
const mongoose = require('mongoose');

class SurveyProgressRepository extends BaseRepository {
  constructor() {
    super(SurveyProgress);
  }

  async findBySurveyAndRespondent(surveyId, respondentId) {
    return await this.model
      .findOne({ surveyId, respondentId })
      .populate('answeredQuestions');
  }

  async findBySurveyWithRespondents(surveyId) {
    return await this.model
      .find({ surveyId })
      .populate('respondentId', 'username email')
      .sort('-updatedAt');
  }

  async findByRespondent(respondentId) {
    return await this.model
      .find({ respondentId })
      .populate('surveyId', 'title')
      .sort('-updatedAt');
  }

  async updateProgress(surveyId, respondentId, questionId) {
    const progress = await this.findBySurveyAndRespondent(surveyId, respondentId);
    
    if (!progress) {
      return null;
    }

    if (!progress.answeredQuestions.includes(questionId)) {
      progress.answeredQuestions.push(questionId);
    }

    if (progress.status === 'NOT_STARTED') {
      progress.status = 'IN_PROGRESS';
    }
    //to check if all the questions have been answered in the survey
    if(progress.answeredQuestions.length === survey.questions.length) {
      progress.status = 'COMPLETED';
      progress.completedAt = new Date();  
    }
//to compute the current progress of the survey
    progress.progress = (progress.answeredQuestions.length / survey.questions.length) * 100;
    return await progress.save();
  }

  async markAsCompleted(surveyId, respondentId) {
    return await this.model.findOneAndUpdate(
      { surveyId, respondentId },
      { 
        status: 'COMPLETED',
        completedAt: new Date(),
        modifiedBy: respondentId
      },
      { new: true }
    );
  }

  async getCompletionStats(surveyId) {
    const stats = await this.model.aggregate([
      { $match: { surveyId: mongoose.Types.ObjectId(surveyId) } },
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id.toLowerCase()] = {
        count: stat.count,
        avgProgress: Math.round(stat.avgProgress)
      };
      return acc;
    }, {});
  }

  async getSurveyParticipants(surveyId, filters = {}) {

    
    const query = { surveyId };

    if (filters.status) {
      query.status = filters.status;  
    }

    if (filters.minProgress) {
      query.progress = { $gte: Number(filters.minProgress) };
    }

    if (filters.startDate && filters.endDate) {
      query.startedAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    return await this.model
      .find(query)
      .populate('respondentId', 'username email')
      .populate('surveyId', 'title')
      .sort('-updatedAt');
  }

  async getRespondentProgress(respondentId) {

    return await this.model
      .find(respondentId)
      .populate('surveyId', 'title description')
      .sort('-updatedAt');
  }

  async deleteAllProgressForSurvey(surveyId) {
    return await this.model.deleteMany({ surveyId });
  }
}

module.exports = SurveyProgressRepository;