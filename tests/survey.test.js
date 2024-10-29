// Load environment variables from config/.env file
require('dotenv').config({ path: 'config/.env' });
const mongoose = require('mongoose');
const Survey = require('../models/survey');
const { surveyController } = require('../bootstrap') 

describe('Survey Model', () => {
  beforeAll(async () => {
    const url = process.env.MONGO_URI_TESTING; // Use a different database for testing
    console.log('Connecting to MongoDB:', url);
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  //Test Case for Create Survey
  it('should create a new Survey', async () => {
    const timestamp = Date.now();
    const createdBy = new mongoose.Types.ObjectId();

    const req = {
      body: {
        title: `Sample Survey ${new Date().getTime()}`,
        description: 'This is a sample survey',
        createdBy: createdBy,
        isTemplate: false,
        questions: [],
        questionOrder: []
      },
      user: {
        id: createdBy
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await surveyController.createSurvey(req, res);
console.log('@!@!@!@!@!@! result',res.json.mock.calls[0][0]);
console.log(req.body);
    expect(res.status).toHaveBeenCalledWith(201);

    const createdSurvey = res.json.mock.calls[0][0];
    expect(createdSurvey.data.title).toBe(req.body.title);
    expect(createdSurvey.data.description).toBe(req.body.description);
    // expect(createdSurvey.data.createdBy).toEqual(req.body.createdBy);
    expect(createdSurvey.data.isTemplate).toBe(req.body.isTemplate);
    expect(Array.isArray(createdSurvey.data.questions)).toBe(true);
    expect(Array.isArray(createdSurvey.data.questionOrder)).toBe(true);

    const surveyInDb = await Survey.findById(createdSurvey.data._id);
    expect(surveyInDb).toBeDefined();
    expect(surveyInDb.title).toBe(req.body.title);
    expect(surveyInDb.description).toBe(req.body.description);
    expect(surveyInDb.createdBy).toEqual(req.body.createdBy);
    expect(surveyInDb.isTemplate).toBe(req.body.isTemplate);
    expect(Array.isArray(surveyInDb.questions)).toBe(true);
    expect(Array.isArray(surveyInDb.questionOrder)).toBe(true);
  });


 it('should get all surveys', async () => {
    const testSurvey = await Survey.create({
      title: `Test Survey ${new Date().getTime()}`,
      description: 'Test Description',
      createdBy: new mongoose.Types.ObjectId(),
      isTemplate: false,
      questions: [],
      questionOrder: []
    });
    
    const existingSurveys = await Survey.find({});

    const req = {
      query: { includeArchived: 'false' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    res.advancedResults = existingSurveys;
  
    await surveyController.getAllSurveys(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
  
    const foundSurveys = res.json.mock.calls[0][0];
    expect(foundSurveys.data.length).toBe(existingSurveys.length);
    
    existingSurveys.forEach(existingSurvey => {
      const foundSurvey = foundSurveys.data.find(survey => 
        survey.id.toString() === existingSurvey._id.toString()
      );
      expect(foundSurvey).toBeDefined();
      expect(foundSurvey.title).toBe(existingSurvey.title);
      expect(foundSurvey.description).toBe(existingSurvey.description);
      expect(foundSurvey.createdBy.toString()).toBe(existingSurvey.createdBy.toString());
      expect(foundSurvey.isTemplate).toBe(existingSurvey.isTemplate);
      expect(Array.isArray(foundSurvey.questions)).toBe(true);
    });
  });

  it('should get a survey by id', async () => {
    const existingSurvey = await Survey.findOne(); // Fetch any existing survey from the database

    const req = {
      params: { id: existingSurvey._id }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await surveyController.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const foundSurvey = res.json.mock.calls[0][0];
    expect(foundSurvey).toBeDefined();
    expect(foundSurvey.data.title).toBe(existingSurvey.title);
    expect(foundSurvey.data.description).toBe(existingSurvey.description);
    expect(foundSurvey.data.createdBy).toEqual(existingSurvey.createdBy);
    expect(foundSurvey.data.isTemplate).toBe(existingSurvey.isTemplate);
    expect(Array.isArray(foundSurvey.data.questions)).toBe(true);
    expect(Array.isArray(foundSurvey.data.questionOrder)).toBe(true);
  });

  it('should update a survey by id', async () => {
    const existingSurvey = await Survey.findOne();
    const timestamp = Date.now();

    const updatedSurveyData = {
      title: `Updated Survey ${new Date().getTime()}`,
      description: 'Updated sample description',
      isTemplate: true,
      isArchived: false
    };

    const req = {
      params: { id: existingSurvey._id },
      body: updatedSurveyData,
      user: { id: existingSurvey.createdBy }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await surveyController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const updatedSurvey = res.json.mock.calls[0][0];
    expect(updatedSurvey.data.title).toBe(updatedSurveyData.title);
    expect(updatedSurvey.data.description).toBe(updatedSurveyData.description);
    expect(updatedSurvey.data.isTemplate).toBe(updatedSurveyData.isTemplate);
    expect(updatedSurvey.data.isArchived).toBe(updatedSurveyData.isArchived);

    const fetchedSurvey = await Survey.findById(existingSurvey._id);
    expect(fetchedSurvey.title).toBe(updatedSurveyData.title);
    expect(fetchedSurvey.description).toBe(updatedSurveyData.description);
    expect(fetchedSurvey.isTemplate).toBe(updatedSurveyData.isTemplate);
    expect(fetchedSurvey.isArchived).toBe(updatedSurveyData.isArchived);
  });

  it('should delete a survey by id', async () => {
    const existingSurvey = await Survey.findOne();

    const req = {
      params: { id: existingSurvey._id },
      user: { id: existingSurvey.createdBy }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await surveyController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const surveyInDb = await Survey.findById(existingSurvey._id);
    expect(surveyInDb).toBeNull();
  });
});