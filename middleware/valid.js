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

// Validation schemas
const surveySchema = Joi.object({
  title: Joi.string().required().max(500).trim(),
  description: Joi.string().allow('').trim(),
  isTemplate: Joi.boolean(),
  isArchived: Joi.boolean()
});

const questionSchema = Joi.object({
  questionText: Joi.string().required().trim(),
  responseType: Joi.string().valid('text', 'multiple-choice', 'single-choice', 'rating', 'boolean').required(),
  allowMultiple: Joi.boolean(),
  isMandatory: Joi.boolean(),
  order: Joi.number().min(0),
  responseValues: Joi.when('responseType', {
    is: Joi.string().valid('multiple-choice', 'single-choice'),
    then: Joi.array().items(Joi.string().required()).min(1).required(),
    otherwise: Joi.forbidden()
  })
});

const answerSchema = Joi.object({
  answerValue: Joi.alternatives().conditional('questionType', {
    switch: [
      {
        is: 'text',
        then: Joi.string().required().trim()
      },
      {
        is: 'multiple-choice',
        then: Joi.array().items(Joi.string()).min(1).required()
      },
      {
        is: 'single-choice',
        then: Joi.string().required()
      },
      {
        is: 'rating',
        then: Joi.number().min(1).max(5).required()
      },
      {
        is: 'boolean',
        then: Joi.boolean().required()
      }
    ]
  })
});

module.exports = {
  validateSurvey: validateRequest(surveySchema),
  validateQuestion: validateRequest(questionSchema),
  validateAnswer: validateRequest(answerSchema)
};