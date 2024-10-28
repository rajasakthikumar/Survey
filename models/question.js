const mongoose = require('mongoose');
const { baseModelOptions, baseSchemaFields } = require('./baseModel');

const ResponseValueSchema = new mongoose.Schema({
  value: {
    type: String,
    required: [true, 'Please add a response value'],
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  questionText: {
    type: String,
    required: [true, 'Please add the question text'],
    trim: true
  },
  responseType: {
    type: String,
    enum: ['text', 'multiple-choice', 'single-choice', 'rating', 'boolean'],
    required: [true, 'Please specify the response type']
  },
  allowMultiple: {
    type: Boolean,
    default: false
  },
  isMandatory: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  ...baseSchemaFields
}, baseModelOptions);

// Indexes
QuestionSchema.index({ surveyId: 1, order: 1 });
QuestionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Question', QuestionSchema);