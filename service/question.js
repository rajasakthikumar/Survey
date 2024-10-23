const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class QuestionService extends BaseService {
  constructor(questionRepository, surveyService) {
    super(questionRepository);
    this.surveyService = surveyService;
  }

  async createQuestion(data) {
    const maxOrder = await this.repository.getMaxOrder(data.surveyId);
    const questionData = {
      ...data,
      order: maxOrder + 1
    };

    const question = await this.create(questionData);

    await this.surveyService.addQuestionToSurvey(question.surveyId, question._id);

    return question;
  }

  async getQuestionById(questionId) {
    const question = await this.findById(questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }
    return question;
  }

  async updateQuestion(questionId, data) {
    const question = await this.findById(questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }

    if (data.responseValues && 
        (question.responseType === 'multiple-choice' || 
         question.responseType === 'single-choice')) {
      if (data.responseValues.length < 2) {
        throw new CustomError('Choice questions must have at least 2 options', 400);
      }
      data.responseValues = data.responseValues.map((value, index) => ({
        value,
        order: index
      }));
    }

    const updateData = {
      ...data,
      responseType: undefined,
      surveyId: undefined,
      order: undefined
    };

    return await this.updateById(questionId, updateData);
  }

  async deleteQuestion(questionId) {
    const question = await this.findById(questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }

    await this.surveyService.removeQuestionFromSurvey(question.surveyId, questionId);

    await this.deleteById(questionId);

    await this.reorderQuestionsAfterDelete(question.surveyId, question.order);

    return question;
  }

  async deleteQuestionsBySurveyId(surveyId) {
    const questions = await this.findAll({ surveyId });
    for (const question of questions) {
      await this.deleteById(question._id);
    }
  }

  async moveQuestion(surveyId, questionId, direction) {
    const survey = await this.surveyService.findById(surveyId);
    if (!survey) {
      throw new CustomError('Survey not found', 404);
    }

    const question = await this.findById(questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }

    const currentOrder = question.order;
    const questions = await this.findAll({ 
      surveyId, 
      order: direction === 'up' ? currentOrder - 1 : currentOrder + 1 
    });

    if (questions.length === 0) {
      throw new CustomError(`Cannot move question ${direction}`, 400);
    }

    const otherQuestion = questions[0];

    await this.updateById(question._id, { order: otherQuestion.order });
    await this.updateById(otherQuestion._id, { order: currentOrder });

    const updatedQuestions = await this.findAll(
      { surveyId }, 
      { sort: { order: 1 } }
    );
    
    await this.surveyService.reorderQuestions(
      surveyId,
      updatedQuestions.map(q => q._id)
    );

    return await this.surveyService.findById(surveyId);
  }

  async reorderQuestionsAfterDelete(surveyId, deletedOrder) {
    const questionsToReorder = await this.findAll({
      surveyId,
      order: { $gt: deletedOrder }
    });

    for (const question of questionsToReorder) {
      await this.updateById(question._id, {
        order: question.order - 1
      });
    }
  }

  async duplicateQuestion(questionId, newSurveyId, userId) {
    const originalQuestion = await this.findById(questionId);
    if (!originalQuestion) {
      throw new CustomError('Question not found', 404);
    }

    const maxOrder = await this.repository.getMaxOrder(newSurveyId);

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

    return await this.create(questionData);
  }

  async validateQuestionType(questionId, answerValue) {
    const question = await this.findById(questionId);
    if (!question) {
      throw new CustomError('Question not found', 404);
    }

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
  }
}

module.exports = QuestionService;