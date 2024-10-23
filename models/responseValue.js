const mongoose = require('mongoose');

const ResponseValueSchema = new mongoose.Schema(
  {
    responseValue: {
      type: String,
      required: [true, 'Please add a response value'],
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResponseValue', ResponseValueSchema);
