const mongoose = require('mongoose');
const { baseModelOptions, baseSchemaFields } = require('./baseModel');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  respondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answerValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isValid: {
    type: Boolean,
    default: false
  },
  validatedAt: {
    type: Date
  },
  ...baseSchemaFields
}, baseModelOptions);

AnswerSchema.index({ questionId: 1, respondentId: 1 }, { unique: true });
AnswerSchema.index({ surveyId: 1 });
AnswerSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Answer', AnswerSchema);