const BaseService = require('./baseService');
const CustomError = require('../utils/customError');
const mongoose = require('mongoose');

class QuestionService extends BaseService {
  constructor(questionRepository, surveyService) {
    super(questionRepository);
    this.surveyService = surveyService;
  }

  async createQuestion(data) {
    try {

      if (!data.surveyId) {
        throw new CustomError('Survey ID is required', 400);
      }      

      const survey = await this.surveyService.getSurveyById(data.surveyId);
      if (!survey) {
        throw new CustomError('Survey not found', 404);
      }

      const maxOrder = await this.getMaxQuestionOrder(data.surveyId);
      
      const questionData = {
        questionText: data.questionText,
        responseType: data.responseType,
        isMandatory: data.isMandatory,
        surveyId: data.surveyId,
        order: maxOrder + 1,
        createdBy: data.createdBy
      };

      if (['multiple-choice', 'single-choice'].includes(data.responseType)) {
        questionData.responseValues = data.responseValues;
        questionData.allowMultiple = data.allowMultiple || false;
      }


      const question = await this.repository.create(questionData);

      if (question._id) {
        await this.surveyService.addQuestionToSurvey(data.surveyId, question._id);
      }

      return question;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(`Error creating question: ${error.message}`, 500);
    }
  }

  async getMaxQuestionOrder(surveyId) {
    try {
      const questions = await this.repository.find(
        { surveyId },
        { 
          sort: { order: -1 },
          limit: 1
        }
      );
      return questions.length > 0 ? questions[0].order : 0;
    } catch (error) {
      console.error('Error getting max order:', error);
      return 0;
    }
  }

  async getQuestionById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid question ID', 400);
      }

      const question = await this.repository.findById(id);
      if (!question) {
        throw new CustomError('Question not found', 404);
      }

      return question;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error retrieving question', 500);
    }
  }

  async getMaxQuestionOrder(surveyId) {
    try {
      const questions = await this.repository.find(
        { surveyId },
        { 
          sort: { order: -1 },
          limit: 1,
          select: 'order'
        }
      );
      return questions.length > 0 ? questions[0].order : 0;
    } catch (error) {
      throw new CustomError('Error getting max question order', 500);
    }
  }

  async getQuestionsBySurvey(surveyId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(surveyId)) {
        throw new CustomError('Invalid survey ID', 400);
      }

      return await this.repository.find(
        { surveyId },
        { 
          sort: { order: 1 },
          select: '-__v'
        }
      );
    } catch (error) {
      throw new CustomError('Error getting survey questions', 500);
    }
  }

  async updateQuestion(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid question ID', 400);
      }

      const question = await this.getQuestionById(id);

      const updateData = {
        ...data,
        surveyId: undefined,
        order: undefined,
        responseType: undefined 
      };

      if (updateData.responseValues) {
        await this.validateResponseValues(question.responseType, updateData.responseValues);
      }

      const updatedQuestion = await this.repository.updateById(id, updateData);
      if (!updatedQuestion) {
        throw new CustomError('Question not found', 404);
      }

      return updatedQuestion;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error updating question', 500);
    }
  }

  async deleteQuestion(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid question ID', 400);
      }

      const question = await this.getQuestionById(id);
      
      await this.repository.deleteById(id);

      const remainingQuestions = await this.getQuestionsBySurvey(question.surveyId);
      await this.reorderSurveyQuestions(
        question.surveyId,
        remainingQuestions.map(q => q._id)
      );

      await this.surveyService.removeQuestionFromSurvey(question.surveyId, id);

      return { success: true, message: 'Question deleted successfully' };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error deleting question', 500);
    }
  }

  async reorderSurveyQuestions(surveyId, questionOrder) {
    try {
      if (!mongoose.Types.ObjectId.isValid(surveyId)) {
        throw new CustomError('Invalid survey ID', 400);
      }

      const questions = await this.getQuestionsBySurvey(surveyId);
      const existingIds = new Set(questions.map(q => q._id.toString()));
      
      const validOrder = questionOrder.every(id => existingIds.has(id.toString()));
      if (!validOrder) {
        throw new CustomError('Invalid question order provided', 400);
      }

      const bulkOps = questionOrder.map((questionId, index) => ({
        updateOne: {
          filter: { _id: questionId, surveyId },
          update: { $set: { order: index } }
        }
      }));

      await this.repository.bulkWrite(bulkOps);
      return await this.getQuestionsBySurvey(surveyId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error reordering questions', 500);
    }
  }

  async moveQuestion(surveyId, questionId, direction) {
    try {
      if (!mongoose.Types.ObjectId.isValid(surveyId) || 
          !mongoose.Types.ObjectId.isValid(questionId)) {
        throw new CustomError('Invalid survey or question ID', 400);
      }

      const question = await this.getQuestionById(questionId);
      
      const nearQuestion = await this.repository.findOne({
        surveyId,
        order: direction === 'up' ? question.order - 1 : question.order + 1
      });

      if (!nearQuestion) {
        throw new CustomError(`Cannot move question ${direction}`, 400);
      }

      const tempOrder = question.order;
      await this.repository.updateById(question._id, { order: nearQuestion.order });
      await this.repository.updateById(nearQuestion._id, { order: tempOrder });

      return await this.getQuestionsBySurvey(surveyId);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error moving question', 500);
    }
  }

  async duplicateQuestion(questionId, newSurveyId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(questionId) || 
          !mongoose.Types.ObjectId.isValid(newSurveyId)) {
        throw new CustomError('Invalid question or survey ID', 400);
      }

      const originalQuestion = await this.getQuestionById(questionId);
      const maxOrder = await this.getMaxQuestionOrder(newSurveyId);

      const questionData = {
        surveyId: newSurveyId,
        questionText: originalQuestion.questionText,
        responseType: originalQuestion.responseType,
        responseValues: originalQuestion.responseValues,
        allowMultiple: originalQuestion.allowMultiple,
        isMandatory: originalQuestion.isMandatory,
        order: maxOrder + 1,
        createdBy: userId
      };

      return await this.repository.create(questionData);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error duplicating question', 500);
    }
  }

  async validateQuestionData(data) {
    const validTypes = ['text', 'multiple-choice', 'single-choice', 'rating', 'boolean'];
    if (!validTypes.includes(data.responseType)) {
      throw new CustomError('Invalid question type', 400);
    }

    await this.validateResponseValues(data.responseType, data.responseValues);

    if (data.responseType !== 'multiple-choice' && data.allowMultiple) {
      throw new CustomError('allowMultiple can only be true for multiple-choice questions', 400);
    }

    return true;
  }

  async validateResponseValues(responseType, responseValues) {
    switch (responseType) {
      case 'multiple-choice':
      case 'single-choice':
        if (!Array.isArray(responseValues) || responseValues.length < 2) {
          throw new CustomError('Choice questions must have at least 2 options', 400);
        }
        break;

      case 'rating':
        if (responseValues !== undefined) {
          throw new CustomError('Rating questions cannot have response values', 400);
        }
        break;

      case 'boolean':
        if (responseValues !== undefined) {
          throw new CustomError('Boolean questions cannot have response values', 400);
        }
        break;

      case 'text':
        if (responseValues !== undefined) {
          throw new CustomError('Text questions cannot have response values', 400);
        }
        break;

      default:
        throw new CustomError('Invalid question type', 400);
    }

    return true;
  }

  async validateQuestionResponse(questionId, answerValue) {
    try {
      const question = await this.getQuestionById(questionId);
      
      switch (question.responseType) {
        case 'text':
          if (typeof answerValue !== 'string') {
            throw new CustomError('Answer must be a text value', 400);
          }
          break;

        case 'multiple-choice':
          if (!Array.isArray(answerValue)) {
            throw new CustomError('Answer must be an array for multiple-choice questions', 400);
          }
          if (!question.allowMultiple && answerValue.length > 1) {
            throw new CustomError('Multiple selections not allowed for this question', 400);
          }
          const validValues = question.responseValues.map(rv => rv.value);
          const invalidValues = answerValue.filter(v => !validValues.includes(v));
          if (invalidValues.length > 0) {
            throw new CustomError(`Invalid options selected: ${invalidValues.join(', ')}`, 400);
          }
          break;

        case 'single-choice':
          if (Array.isArray(answerValue)) {
            throw new CustomError('Single choice question cannot have multiple answers', 400);
          }
          if (!question.responseValues.some(rv => rv.value === answerValue)) {
            throw new CustomError('Invalid option selected', 400);
          }
          break;

        case 'rating':
          const rating = Number(answerValue);
          if (isNaN(rating) || rating < 1 || rating > 5) {
            throw new CustomError('Rating must be a number between 1 and 5', 400);
          }
          break;

        case 'boolean':
          if (typeof answerValue !== 'boolean') {
            throw new CustomError('Answer must be true or false', 400);
          }
          break;

        default:
          throw new CustomError('Invalid question type', 400);
      }

      return true;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError('Error validating question response', 500);
    }
  }
}

module.exports = QuestionService;