const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userFixture = async () => {
  const password = await bcrypt.hash('Password123', 10);
  return {
    _id: new mongoose.Types.ObjectId(),
    username: 'testuser',
    email: 'test@example.com',
    password,
    role: 'user'
  };
};

const surveyFixture = (userId) => ({
  _id: new mongoose.Types.ObjectId(),
  title: 'Test Survey',
  description: 'Test Description',
  createdBy: userId,
  questions: [],
  questionOrder: []
});

const questionFixture = (surveyId, userId) => ({
  _id: new mongoose.Types.ObjectId(),
  surveyId,
  questionText: 'Test Question',
  responseType: 'multiple-choice',
  allowMultiple: true,
  isMandatory: false,
  createdBy: userId,
  order: 0
});

module.exports = {
  userFixture,
  surveyFixture,
  questionFixture
};