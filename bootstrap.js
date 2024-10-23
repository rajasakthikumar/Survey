const SurveyRepository = require('./repositories/survey');
const QuestionRepository = require('./repositories/question');
const AnswerRepository = require('./repositories/answer');
const UserRepository = require('./repositories/user');

const SurveyService = require('./service/survey');
const QuestionService = require('./service/question');
const AnswerService = require('./service/answer');
const UserService = require('./service/user');

const SurveyController = require('./controller/survey');
const QuestionController = require('./controller/question');
const AnswerController = require('./controller/answer');
const UserController = require('./controller/user');

// Initialize repositories
const surveyRepository = new SurveyRepository();
const questionRepository = new QuestionRepository();
const answerRepository = new AnswerRepository();
const userRepository = new UserRepository();


const surveyService = new SurveyService(surveyRepository);
const questionService = new QuestionService(questionRepository, surveyService);
surveyService.setQuestionService(questionService);

const answerService = new AnswerService(answerRepository, questionService);
const userService = new UserService(userRepository);

// Initialize controllers
const surveyController = new SurveyController(surveyService);
const questionController = new QuestionController(questionService);
const answerController = new AnswerController(answerService);
const userController = new UserController(userService);

module.exports = {
  surveyController,
  questionController,
  answerController,
  userController,
};