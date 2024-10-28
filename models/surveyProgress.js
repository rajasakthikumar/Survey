const mongoose = require('mongoose');
const { baseModelOptions, baseSchemaFields } = require('./baseModel');

const SurveyProgressSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'NOT_STARTED'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  lastAnsweredAt: {
    type: Date
  },
  answeredQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  ...baseSchemaFields
}, baseModelOptions);

SurveyProgressSchema.index({ surveyId: 1, respondentId: 1 }, { unique: true });
SurveyProgressSchema.index({ status: 1 });
SurveyProgressSchema.index({ completedAt: 1 });
SurveyProgressSchema.index({ respondentId: 1, status: 1 });

SurveyProgressSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'IN_PROGRESS' && !this.startedAt) {
      this.startedAt = new Date();
    } else if (this.status === 'COMPLETED' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  if (this.isModified('answeredQuestions')) {
    this.lastAnsweredAt = new Date();
  }
  next();
});

SurveyProgressSchema.methods.isCompleted = function() {
  return this.status === 'COMPLETED';
};

SurveyProgressSchema.methods.isStarted = function() {
  return this.status !== 'NOT_STARTED';
};

module.exports = mongoose.model('SurveyProgress', SurveyProgressSchema);