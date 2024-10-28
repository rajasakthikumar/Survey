const SurveyRepository = require('./repositories/survey');
const QuestionRepository = require('./repositories/question');
const AnswerRepository = require('./repositories/answer');
const UserRepository = require('./repositories/user');
const SurveyProgressRepository = require('./repositories/surveyProgress');

const SurveyService = require('./service/survey');
const QuestionService = require('./service/question');
const AnswerService = require('./service/answer');
const UserService = require('./service/user');
const SurveyProgressService = require('./service/surveyProgress');

const SurveyController = require('./controller/survey');
const QuestionController = require('./controller/question');
const AnswerController = require('./controller/answer');
const UserController = require('./controller/user');
const SurveyProgressController = require('./controller/surveyProgress');

// Initialize repositories
const surveyRepository = new SurveyRepository();
const questionRepository = new QuestionRepository();
const answerRepository = new AnswerRepository();
const userRepository = new UserRepository();
const surveyProgressRepository = new SurveyProgressRepository();

const surveyService = new SurveyService(surveyRepository);
const questionService = new QuestionService(questionRepository, surveyService);
surveyService.setQuestionService(questionService);

const userService = new UserService(userRepository);
const surveyProgressService = new SurveyProgressService(
  surveyProgressRepository,
  surveyService,
  questionService
);

const answerService = new AnswerService(answerRepository, questionService, surveyService, surveyProgressService);
const surveyController = new SurveyController(surveyService);
const questionController = new QuestionController(questionService);
const answerController = new AnswerController(answerService);
const userController = new UserController(userService);
const surveyProgressController = new SurveyProgressController(surveyProgressService);

module.exports = {
  surveyController,
  questionController,
  answerController,
  userController,
  surveyProgressController,
};