const request = require('supertest');
const app = require('../../index');
const mongoose = require('mongoose');
const { userFixture, surveyFixture } = require('../fixtures');
const { connect, closeDatabase, clearDatabase } = require('../setup');
const generateToken = require('../../utils/generateToken');

describe('Survey API', () => {
  let token;
  let user;
  let survey;

  beforeAll(async () => {
    await connect();
    user = await userFixture();
    token = generateToken(user._id);
    await mongoose.connection.collection('users').insertOne(user);
  });

  beforeEach(async () => {
    survey = surveyFixture(user._id);
    await mongoose.connection.collection('surveys').insertOne(survey);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('GET /api/surveys', () => {
    it('should return all surveys', async () => {
      const res = await request(app)
        .get('/api/surveys')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });
});