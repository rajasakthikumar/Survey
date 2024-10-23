const Joi = require('joi');

const schemas = {
  // User validation schemas
  user: {
    register: Joi.object({
      username: Joi.string().required().min(3).max(30),
      email: Joi.string().required().email(),
      password: Joi.string()
        .required()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .message('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    }),

    login: Joi.object({
      email: Joi.string().required().email(),
      password: Joi.string().required()
    }),

    update: Joi.object({
      username: Joi.string().min(3).max(30),
      email: Joi.string().email()
    })
  },

  // Survey validation schemas
  survey: {
    create: Joi.object({
      title: Joi.string().required().max(500).trim(),
      description: Joi.string().allow('').trim(),
      isTemplate: Joi.boolean().default(false),
      isArchived: Joi.boolean().default(false)
    }),

    update: Joi.object({
      title: Joi.string().max(500).trim(),
      description: Joi.string().allow('').trim(),
      isTemplate: Joi.boolean(),
      isArchived: Joi.boolean()
    }),

    reorderQuestions: Joi.object({
      questionOrder: Joi.array().items(
        Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
      ).required()
    })
  },

  // Question validation schemas
  question: {
    create: Joi.object({
      questionText: Joi.string().required().trim(),
      responseType: Joi.string()
        .required()
        .valid('text', 'multiple-choice', 'single-choice', 'rating', 'boolean'),
      allowMultiple: Joi.boolean().when('responseType', {
        is: 'multiple-choice',
        then: Joi.boolean().required(),
        otherwise: Joi.boolean().valid(false)
      }),
      isMandatory: Joi.boolean().default(false),
      responseValues: Joi.when('responseType', {
        is: Joi.string().valid('multiple-choice', 'single-choice'),
        then: Joi.array().items(Joi.string().required()).min(1).required(),
        otherwise: Joi.forbidden()
      })
    }),

    update: Joi.object({
      questionText: Joi.string().trim(),
      isMandatory: Joi.boolean(),
      responseValues: Joi.array().items(Joi.string())
    })
  },

  // Answer validation schemas
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
    })
  }
};

module.exports = schemas;