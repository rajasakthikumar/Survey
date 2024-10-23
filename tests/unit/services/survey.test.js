const SurveyService = require('../../../services/survey');
const CustomError = require('../../../utils/customError');

describe('SurveyService', () => {
  let surveyService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    surveyService = new SurveyService(mockRepository);
  });

  describe('createSurvey', () => {
    it('should create a survey successfully', async () => {
      const surveyData = {
        title: 'Test Survey',
        description: 'Test Description'
      };

      mockRepository.create.mockResolvedValue(surveyData);

      const result = await surveyService.createSurvey(surveyData);

      expect(result).toEqual(surveyData);
      expect(mockRepository.create).toHaveBeenCalledWith(surveyData);
    });
  });
});