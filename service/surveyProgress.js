const BaseService = require('./baseService');
const CustomError = require('../utils/customError');
const mongoose = require('mongoose');

class SurveyProgressService extends BaseService {
  constructor(surveyProgressRepository, surveyService, questionService) {
    super(surveyProgressRepository);
    this.surveyService = surveyService;
    this.questionService = questionService;
  }

  async findBySurveyAndRespondent(surveyId, respondentId) {
    try {
      return await this.repository.findOne({
        surveyId,
        respondentId
      });
    } catch (error) {
      throw new CustomError('Error in finding survey progress', 500);
    }
  }

  async initializeProgress(surveyId, respondentId) {
    try {

      const existingProgress = await this.findBySurveyAndRespondent(surveyId, respondentId);
      if (existingProgress) {
        return existingProgress;
      }

      const survey = await this.surveyService.getSurveyById(surveyId);
      if (!survey) {
        throw new CustomError('Survey is not found', 404);
      }

      const progress = await this.repository.create({
        surveyId,
        respondentId,
        status: 'NOT_STARTED',
        answeredQuestions: [],
        progress: 0,
        startedAt: null,
        completedAt: null,
        lastAnsweredAt: new Date()
      });

      return progress;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error initializing survey progress', 500);
    }
  }

  async updateProgress(surveyId, respondentId, questionId) {
    try {

      let progress = await this.findBySurveyAndRespondent(surveyId, respondentId);
      if (!progress) {
        progress = await this.initializeProgress(surveyId, respondentId);
      }

      const survey = await this.surveyService.getSurveyById(surveyId);
      const totalQuestions = survey.questions.length;

      if (progress.status === 'NOT_STARTED') {
        progress.status = 'IN_PROGRESS';
        progress.startedAt = new Date();
      }

      const questionIdStr = questionId.toString();
      if (!progress.answeredQuestions.map(q => q.toString()).includes(questionIdStr)) {
        progress.answeredQuestions.push(questionId);
      }

      progress.progress = Math.round((progress.answeredQuestions.length / totalQuestions) * 100);

      if (progress.progress === 100) {
        progress.status = 'COMPLETED';
        progress.completedAt = new Date();
      }

      progress.lastAnsweredAt = new Date();

      const updatedProgress = await this.repository.updateById(progress.id, {
        status: progress.status,
        answeredQuestions: progress.answeredQuestions,
        progress: progress.progress,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt,
        lastAnsweredAt: progress.lastAnsweredAt
      });

      return updatedProgress;
    } catch (error) {
            if (error instanceof CustomError) throw error;
      throw new CustomError('Error updating survey progress', 500);
    }
  }

  async getProgress(surveyId, respondentId) {
    try {
      const survey = await this.surveyService.getSurveyById(surveyId);
      if (!survey) {
        throw new CustomError('Survey not found', 404);
      }

      const progress = await this.findBySurveyAndRespondent(surveyId, respondentId);
      if (!progress) {
        throw new CustomError('Survey progress not found', 404);
      }

      return progress;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error retrieving survey progress', 500);
    }
  }

  async getSurveyParticipants(surveyId, queryParams) {
    try {
      const filters = {
        status: queryParams.status,

        minProgress: queryParams.minProgress,

        startDate: queryParams.startDate,
        endDate: queryParams.endDate,


        sortBy: queryParams.sortBy || '-updatedAt'
      };

      const participants = await this.repository.getSurveyParticipants(
        surveyId, 
        filters
      );

      return participants;
    } catch (error) {
      throw new CustomError('Error fetching survey participants', 500);
    }
  }


  async getCompletionStats(surveyId) {
    try {
      const survey = await this.surveyService.getSurveyById(surveyId);
      if (!survey) {
        throw new CustomError('Survey not found', 404);
      }

      const stats = await this.repository.getCompletionStats(surveyId);
      return {
        totalParticipants: stats.reduce((acc, stat) => acc + stat.count, 0),
        statusBreakdown: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            percentage: stat.avgProgress
          };
          return acc;
        }, {}),
        averageCompletion: stats.reduce((acc, stat) => acc + stat.avgProgress, 0) / stats.length
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error getting completion statistics', 500);
    }
  }

  async getMyProgress(respondentId) {
    try {
      const progress = await this.repository.findAll({ respondentId });
      return progress.map(p => ({
        surveyId: p.surveyId,
        status: p.status,
        progress: p.progress,
        startedAt: p.startedAt,
        lastAnsweredAt: p.lastAnsweredAt,
        completedAt: p.completedAt
      }));
    } catch (error) {
      throw new CustomError('Error retrieving your survey progress', 500);
    }
  }

  // doubt in this service

  // async resetProgress(surveyId, respondentId) {
  //   try {
  //     const progress = await this.findBySurveyAndRespondent(surveyId, respondentId);
  //     if (!progress) {
  //       throw new CustomError('Survey progress not found', 404);
  //     }

  //     const resetData = {
  //       status: 'NOT_STARTED',
  //       answeredQuestions: [],
  //       progress: 0,
  //       startedAt: null,
  //       completedAt: null,
  //       lastAnsweredAt: new Date()
  //     };

  //     return await this.repository.updateById(progress.id, resetData);
  //   } catch (error) {
  //     if (error instanceof CustomError) throw error;
  //     throw new CustomError('Error resetting survey progress', 500);
  //   }
  // }

  async bulkUpdateProgress(surveyId, respondentId, questionIds) {
    try {
      let progress = await this.findBySurveyAndRespondent(surveyId, respondentId);
      if (!progress) {
        progress = await this.initializeProgress(surveyId, respondentId);
      }

      const survey = await this.surveyService.getSurveyById(surveyId);
      const totalQuestions = survey.questions.length;

      const uniqueQuestions = new Set([
        ...progress.answeredQuestions.map(q => q.toString()),
        ...questionIds.map(q => q.toString())
      ]);
      progress.answeredQuestions = Array.from(uniqueQuestions);

      if (progress.status === 'NOT_STARTED') {
        progress.status = 'IN_PROGRESS';
        progress.startedAt = new Date();
      }

      progress.progress = Math.round((progress.answeredQuestions.length / totalQuestions) * 100);
      progress.lastAnsweredAt = new Date();

      if (progress.progress === 100) {
        progress.status = 'COMPLETED';
        progress.completedAt = new Date();
      }

      return await this.repository.updateById(progress.id, progress);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error updating survey progress', 500);
    }
  }

  async deleteProgress(surveyId, respondentId) {
    try {
      const progress = await this.findBySurveyAndRespondent(surveyId, respondentId);
      if (!progress) {
        throw new CustomError('Survey progress not found', 404);
      }

      await this.repository.deleteById(progress.id);
      return { message: 'Survey progress deleted successfully' };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error deleting survey progress', 500);
    }
  }
}

module.exports = SurveyProgressService;