const BaseService = require('./baseService');
const CustomError = require('../utils/customError');
const mongoose = require('mongoose');

class SurveyService extends BaseService {
  constructor(surveyRepository) {
    super(surveyRepository);
    this._questionService = null;
  }

  setQuestionService(questionService) {
    this._questionService = questionService;
  }

  async createSurvey(data) {
    try {
      if (!data.title) {
        throw new CustomError('Title is required', 400); 
      }
  
      const existingSurvey = await this.repository.findOne({ 
        title: data.title 
      });
  
      if (existingSurvey) {
        throw new CustomError('Survey with this title already exists', 400);
      }
  
      const survey = await this.create({
        ...data,
        questions: [],
        questionOrder: [],
        isArchived: false,
        archivedAt: null
      });
  
      return await this.getSurveyById(survey.id);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error creating survey', 500); // Changed status to 500 for internal errors
    }
  }
  

  async getSurveyById(id) {
    try {
        console.log('@!@!@!@! ')
      

      const survey = await this.repository.findByIdWithFullDetails(id);
      console.log('@!@!@!@! Found survey:', survey); 
      if (!survey) {
        throw new CustomError('Survey not found', 404);
      }
      return survey;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error retrieving survey', 400);
    }
  }

  async getAllSurveys(filter = {}) {
    try {
      if (filter.isArchived !== undefined) {
        filter.isArchived = filter.isArchived === 'true';
      }
  
      const surveys = await this.repository.findAllWithQuestions(filter);
      return surveys.map(survey => ({
        id: survey.id || survey._id,
        title: survey.title,
        description: survey.description,
        isTemplate: survey.isTemplate,
        isArchived: survey.isArchived,
        questions: Array.isArray(survey.questions) ? survey.questions.map(q => ({
          id: q.id || q._id,
          questionText: q.questionText,
          responseType: q.responseType,
          isMandatory: q.isMandatory,
          order: q.order,
          responseValues: q.responseValues
        })) : [],
        questionCount: Array.isArray(survey.questions) ? survey.questions.length : 0,
        isComplete: Array.isArray(survey.questions) && survey.questions.length > 0,
        createdBy: survey.createdBy,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt
      }));
    } catch (error) {
      throw new CustomError('Error retrieving surveys', 400);
    }
  }
  async updateSurvey(id, data, userId) {
    try {
        console.log(`@!@!@!@! Update survey process started for survey ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`@!@!@!@! Invalid survey ID provided: ${id}`);
            throw new CustomError('Invalid survey ID', 400);
        }

        // Fetch the survey before updating
        const survey = await this.getSurveyById(id);
        console.log(`@!@!@!@! Found survey before update: ${JSON.stringify(survey)}`);

        // Check for duplicate title if a new title is provided
        if (data.title && data.title !== survey.title) {
            console.log(`@!@!@!@! Checking for duplicate title: ${data.title}`);
            const existingSurvey = await this.repository.findOne({ 
                title: data.title,
                _id: { $ne: id }
            });
            if (existingSurvey) {
                console.log(`@!@!@!@! Duplicate title found for title: ${data.title}`);
                throw new CustomError('Survey with this title already exists', 400);
            }
        }

        // Update survey with new data
        console.log(`@!@!@!@! Updating survey with data: ${JSON.stringify(data)}`);
        const updatedSurvey = await this.repository.updateById(id, {
            ...data,
            modifiedBy: userId,
            modifiedAt: new Date()
        });
        console.log(`@!@!@!@! Survey updated successfully. Updated survey data: ${JSON.stringify(updatedSurvey)}`);
        // Fetch and return the updated survey
        const result = await this.getSurveyById(updatedSurvey._id);
        console.log(`@!@!@!@! Retrieved updated survey: ${JSON.stringify(result)}`);
        return result;
    } catch (error) {
        console.error(`@!@!@!@! Error in updateSurvey: ${error.message}`);
        if (error instanceof CustomError) throw error;
        throw new CustomError('Error updating survey', 500);
    }
}


  async addQuestionToSurvey(surveyId, questionId) {
    try {
        console.log('@!@!@!@! This function is called')
      if (!mongoose.Types.ObjectId.isValid(surveyId) || 
          !mongoose.Types.ObjectId.isValid(questionId)) {
        throw new CustomError('Invalid survey or question ID', 400);
      }

      const survey = await this.repository.findById(surveyId);
      if (!survey) {
        throw new CustomError('Survey not found', 404);
      }

      if (!survey.questions) survey.questions = [];
      if (!survey.questionOrder) survey.questionOrder = [];
      console.log('@!@!@!@! in survey service',survey.questions)
      if (!survey.questions.includes(questionId)) {
        survey.questions.push(questionId);
        survey.questionOrder.push(questionId);
        
        await this.repository.updateById(surveyId, {
          questions: survey.questions,
          questionOrder: survey.questionOrder
        });
      }

      return await this.getSurveyById(surveyId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error adding question to survey', 500);
    }
  }

  async removeQuestionFromSurvey(surveyId, questionId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(surveyId) || 
          !mongoose.Types.ObjectId.isValid(questionId)) {
        throw new CustomError('Invalid survey or question ID', 400);
      }

      const survey = await this.getSurveyById(surveyId);

      survey.questions = survey.questions.filter(
        id => id.toString() !== questionId.toString()
      );
      survey.questionOrder = survey.questionOrder.filter(
        id => id.toString() !== questionId.toString()
      );

      await this.repository.updateById(surveyId, {
        questions: survey.questions,
        questionOrder: survey.questionOrder
      });

      return await this.getSurveyById(surveyId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error removing question from survey', 500);
    }
  }

  async archiveSurvey(id, userId) {
    try {
      const survey = await this.getSurveyById(id);

      if (survey.isArchived) {
        throw new CustomError('Survey is already archived', 400);
      }

      await this.repository.updateById(id, {
        isArchived: true,
        archivedAt: new Date(),
        modifiedBy: userId
      });

      return await this.getSurveyById(id);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error archiving survey', 500);
    }
  }

  async unarchiveSurvey(id, userId) {
    try {
      const survey = await this.getSurveyById(id);

      if (!survey.isArchived) {
        throw new CustomError('Survey is not archived', 400);
      }

      await this.repository.updateById(id, {
        isArchived: false,
        archivedAt: null,
        modifiedBy: userId
      });

      return await this.getSurveyById(id);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error unarchiving survey', 500);
    }
  }

  async duplicateSurvey(id, userId) {
    try {
      const originalSurvey = await this.getSurveyById(id);

      const newSurvey = await this.createSurvey({
        title: `${originalSurvey.title} (Copy)`,
        description: originalSurvey.description,
        isTemplate: originalSurvey.isTemplate,
        createdBy: userId
      });

      if (originalSurvey.questions && originalSurvey.questions.length > 0) {
        for (const question of originalSurvey.questions) {
          const newQuestion = await this._questionService.duplicateQuestion(
            question._id,
            newSurvey._id,
            userId
          );
          await this.addQuestionToSurvey(newSurvey._id, newQuestion._id);
        }
      }

      return await this.getSurveyById(newSurvey._id);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error duplicating survey', 500);
    }
  }

  async reorderQuestions(surveyId, questionOrder) {
    try {
      const survey = await this.getSurveyById(surveyId);

      const currentQuestions = new Set(survey.questions.map(q => q.toString()));
      const validOrder = questionOrder.every(id => currentQuestions.has(id.toString()));
      
      if (!validOrder) {
        throw new CustomError('Invalid question order provided', 400);
      }

      await this.repository.updateById(surveyId, {
        questionOrder: questionOrder
      });

      if (this._questionService) {
        await this._questionService.reorderSurveyQuestions(surveyId, questionOrder);
      }

      return await this.getSurveyById(surveyId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error reordering questions', 500);
    }
  }

  async deleteSurvey(id, userId) {
    try {
      const survey = await this.getSurveyById(id);

      if (survey.questions && survey.questions.length > 0) {
        for (const questionId of survey.questions) {
          await this._questionService.deleteQuestion(questionId);
        }
      }

      await this.deleteById(id);
      return { success: true, message: 'Survey deleted successfully' };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error deleting survey', 500);
    }
  }

  async validateSurveyAccess(surveyId, userId, requiredRole = null) {
    try {
      const survey = await this.getSurveyById(surveyId);
      
      if (survey.createdBy.toString() !== userId.toString() && 
          (requiredRole && requiredRole !== 'admin')) {
        throw new CustomError('Not authorized to access this survey', 403);
      }
      
      return survey;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error validating survey access', 500);
    }
  }

  async getSurveyStats(surveyId) {
    try {
      const survey = await this.getSurveyById(surveyId);
      
      return {
        totalQuestions: survey.questions.length,
        questionTypes: survey.questions.reduce((acc, q) => {
          acc[q.responseType] = (acc[q.responseType] || 0) + 1;
          return acc;
        }, {}),
        mandatoryQuestions: survey.questions.filter(q => q.isMandatory).length,
        isComplete: survey.questions.length > 0,
        lastUpdated: survey.updatedAt,
        createdAt: survey.createdAt
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error getting survey statistics', 500);
    }
  }
}

module.exports = SurveyService;