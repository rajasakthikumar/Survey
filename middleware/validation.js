const Joi = require('joi');
const CustomError = require('../utils/customError');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      throw new CustomError(errorMessage, 400);
    }

    next();
  };
};

const schemas = {
  survey: {
    create: Joi.object({
      title: Joi.string()
        .required()
        .max(500)
        .trim()
        .messages({
          'string.empty': 'Title cannot be empty',
          'string.max': 'Title cannot exceed 500 characters'
        }),
      description: Joi.string()
        .allow('')
        .trim(),
      isTemplate: Joi.boolean()
        .default(false)
    }),

    update: Joi.object({
      title: Joi.string()
        .max(500)
        .trim(),
      description: Joi.string()
        .allow('')
        .trim(),
      isTemplate: Joi.boolean(),
      isArchived: Joi.boolean()
    }),

    reorderQuestions: Joi.object({
      questionOrder: Joi.array()
        .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
        .required()
        .messages({
          'array.base': 'Question order must be an array',
          'string.pattern.base': 'Invalid question ID format'
        })
    })
  },

  question: {
    create: Joi.object({
      questionText: Joi.string()
        .required()
        .trim()
        .messages({
          'string.empty': 'Question text cannot be empty'
        }),
      responseType: Joi.string()
        .required()
        .valid('text', 'multiple-choice', 'single-choice', 'rating', 'boolean'),
      allowMultiple: Joi.when('responseType', {
        is: 'multiple-choice',
        then: Joi.boolean().required(),
        otherwise: Joi.boolean().valid(false)
      }),
      isMandatory: Joi.boolean()
        .default(false),
      responseValues: Joi.when('responseType', {
        is: Joi.string().valid('multiple-choice', 'single-choice'),
        then: Joi.array()
          .items(Joi.string().required())
          .min(2)
          .required()
          .messages({
            'array.min': 'At least 2 response options are required',
            'array.required': 'Response options are required for choice questions'
          }),
        otherwise: Joi.forbidden()
      })
    }),

    update: Joi.object({
      questionText: Joi.string()
        .trim(),
      isMandatory: Joi.boolean(),
      responseValues: Joi.array()
        .items(Joi.string())
    })
  },

  answer: {
    submit: Joi.object({
      answerValue: Joi.alternatives()
        .try(
          Joi.string(),
          Joi.array().items(Joi.string()),
          Joi.number().min(1).max(5),
          Joi.boolean()
        )
        .required()
        .messages({
          'alternatives.match': 'Invalid answer format for this question type'
        })
    })
  },

  user: {
    register: Joi.object({
      username: Joi.string()
        .required()
        .min(3)
        .max(30)
        .trim()
        .messages({
          'string.min': 'Username must be at least 3 characters',
          'string.max': 'Username cannot exceed 30 characters'
        }),
      email: Joi.string()
        .required()
        .email()
        .messages({
          'string.email': 'Please provide a valid email'
        }),
      password: Joi.string()
        .required()
        .min(6)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
          'string.min': 'Password must be at least 6 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        })
    }),

    login: Joi.object({
      email: Joi.string()
        .required()
        .email(),
      password: Joi.string()
        .required()
    })
  }
};

module.exports = {
  validateSurvey: validateRequest(schemas.survey.create),
  validateSurveyUpdate: validateRequest(schemas.survey.update),
  validateQuestion: validateRequest(schemas.question.create),
  validateQuestionUpdate: validateRequest(schemas.question.update),
  validateAnswer: validateRequest(schemas.answer.submit),
  validateUserRegister: validateRequest(schemas.user.register),
  validateUserLogin: validateRequest(schemas.user.login),
  validateReorderQuestions: validateRequest(schemas.survey.reorderQuestions)
};