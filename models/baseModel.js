const mongoose = require('mongoose');

const baseModelOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
    }
  },
  toObject: {
    virtuals: true
  }
};

const baseSchemaFields = {
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
};

module.exports = {
  baseModelOptions,
  baseSchemaFields
};