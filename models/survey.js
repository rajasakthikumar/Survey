const mongoose = require('mongoose');
const { baseModelOptions, baseSchemaFields } = require('./baseModel');

const SurveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    unique: true,
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  questionOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  ...baseSchemaFields
}, baseModelOptions);

SurveySchema.index({ title: 1 }, { unique: true });
SurveySchema.index({ createdBy: 1 });
SurveySchema.index({ isArchived: 1 });

module.exports = mongoose.model('Survey', SurveySchema);