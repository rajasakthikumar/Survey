# Survey Management System API Documentation

A comprehensive backend system for managing surveys, questions, responses, and user progress. Built with Node.js, Express, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- User registration and login with JWT authentication
- Role-based access control (admin/user)
- Secure password hashing using bcrypt
- Token-based authentication for API routes

### Survey Management
- Create, read, update, and delete surveys
- Support for different survey states (active, archived)
- Survey duplication functionality
- Question ordering and reordering
- Survey templates support
- Progress tracking for each respondent

### Question Types
- Multiple Choice (single selection)
- Multiple Choice (multiple selections)
- Text Response
- Rating (1-5 scale)
- Boolean (Yes/No)

### Response Management
- Answer validation based on question type
- Prevention of duplicate answers
- Answer modification tracking
- Response statistics and analytics
- Progress tracking per user

### Progress Tracking
- Real-time progress calculation
- Status tracking (NOT_STARTED, IN_PROGRESS, COMPLETED)
- Progress reset functionality
- Completion timestamps
- Answer tracking

## 🛠 Technical Architecture

### Data Models

#### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  lastLogin: Date
}
```

#### Survey Model
```javascript
{
  title: String,
  description: String,
  isTemplate: Boolean,
  isArchived: Boolean,
  questionOrder: [ObjectId],
  questions: [ObjectId],
  createdBy: ObjectId,
  archivedAt: Date
}
```

#### Question Model
```javascript
{
  surveyId: ObjectId,
  questionText: String,
  responseType: String (enum: ['text', 'multiple-choice', 'single-choice', 'rating', 'boolean']),
  responseValues: [{ value: String, order: Number }],
  allowMultiple: Boolean,
  isMandatory: Boolean,
  order: Number
}
```

#### Answer Model
```javascript
{
  questionId: ObjectId,
  surveyId: ObjectId,
  respondentId: ObjectId,
  answerValue: Mixed,
  isValid: Boolean,
  validatedAt: Date
}
```

#### Survey Progress Model
```javascript
{
  surveyId: ObjectId,
  respondentId: ObjectId,
  status: String (enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  answeredQuestions: [ObjectId],
  progress: Number,
  startedAt: Date,
  completedAt: Date,
  lastAnsweredAt: Date
}
```

### Service Layer Architecture

#### Base Service
- Common CRUD operations
- Error handling
- Data validation

#### Survey Service
- Survey management
- Question order management
- Survey duplication
- Survey archiving

#### Question Service
- Question management
- Response type validation
- Question order management
- Question duplication

#### Answer Service
- Answer submission
- Answer validation
- Answer statistics
- Progress tracking integration

#### Survey Progress Service
- Progress tracking
- Status management
- Progress calculation
- Progress reset

### API Endpoints

#### Authentication
```http
POST /api/users/register
POST /api/users/login
GET /api/users/me
```

#### Surveys
```http
GET /api/surveys
POST /api/surveys
GET /api/surveys/:id
PUT /api/surveys/:id
DELETE /api/surveys/:id
POST /api/surveys/:id/duplicate
PUT /api/surveys/:id/archive
PUT /api/surveys/:id/unarchive
PUT /api/surveys/:id/reorder-questions
```

#### Questions
```http
POST /api/questions
GET /api/questions/:id
PUT /api/questions/:id
DELETE /api/questions/:id
PUT /api/questions/:id/move
```

#### Answers
```http
POST /api/answers/questions/:questionId
GET /api/answers/surveys/:surveyId
GET /api/answers/surveys/:surveyId/my-answers
GET /api/answers/questions/:questionId
GET /api/answers/surveys/:surveyId/stats
DELETE /api/answers/:answerId
```

#### Survey Progress
```http
POST /api/survey-progress/surveys/:surveyId/initialize
PUT /api/survey-progress/surveys/:surveyId/questions/:questionId
GET /api/survey-progress/surveys/:surveyId
GET /api/survey-progress/surveys/:surveyId/participants
GET /api/survey-progress/surveys/:surveyId/stats
GET /api/survey-progress/my-progress
POST /api/survey-progress/surveys/:surveyId/reset
```

## 🔧 Setup & Installation

1. Clone the repository
```bash
git clone <repository-url>
cd survey-api
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/survey
JWT_SECRET=your_jwt_secret_here
```

4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## 🔍 Usage Examples

### Create a Survey
```javascript
// Request
POST /api/surveys
{
    "title": "Employee Satisfaction Survey",
    "description": "Annual employee satisfaction survey",
    "isTemplate": false
}

// Response
{
    "success": true,
    "data": {
        "id": "...",
        "title": "Employee Satisfaction Survey",
        "description": "Annual employee satisfaction survey",
        "isTemplate": false,
        "questions": []
    }
}
```

### Add a Question
```javascript
// Request
POST /api/questions
{
    "surveyId": "survey_id",
    "questionText": "How satisfied are you with your work environment?",
    "responseType": "rating",
    "isMandatory": true
}

// Response
{
    "success": true,
    "data": {
        "id": "...",
        "questionText": "How satisfied are you with your work environment?",
        "responseType": "rating",
        "isMandatory": true,
        "order": 1
    }
}
```

### Submit an Answer
```javascript
// Request
POST /api/answers/questions/:questionId
{
    "answerValue": 4
}

// Response
{
    "success": true,
    "data": {
        "id": "...",
        "questionId": "...",
        "answerValue": 4,
        "isValid": true
    }
}
```

### Track Progress
```javascript
// Request
GET /api/survey-progress/surveys/:surveyId

// Response
{
    "success": true,
    "data": {
        "status": "IN_PROGRESS",
        "progress": 60,
        "answeredQuestions": ["...", "..."],
        "startedAt": "2024-10-28T..."
    }
}
```

## 📊 Features in Detail

### Survey Progress Calculation
- Progress is calculated as: (answered questions / total questions) * 100
- Status transitions:
  - NOT_STARTED → IN_PROGRESS: First answer submitted
  - IN_PROGRESS → COMPLETED: All questions answered
- Timestamps tracked:
  - startedAt: First answer time
  - lastAnsweredAt: Most recent answer
  - completedAt: All questions answered

### Answer Validation
- Text: Non-empty string
- Multiple Choice: Valid options from question
- Rating: Number between 1-5
- Boolean: true/false value
- Prevents duplicate answers per question

### Data Integrity
- Transactions for critical operations
- Cascading deletes where appropriate
- Referential integrity checks
- Validation at multiple levels (Model, Service, Controller)

## 🛡️ Security Features

- JWT Authentication
- Password Hashing
- Input Sanitization
- Rate Limiting
- Error Handling
- Request Validation
- Role-Based Access

## 🔄 Business Logic Flow

1. **Survey Creation**
   - Survey created
   - Questions added
   - Order maintained
   - Validation applied

2. **Answer Submission**
   - Answer validated
   - Progress updated
   - Statistics recalculated
   - Timestamps updated

3. **Progress Tracking**
   - Real-time calculation
   - Status management
   - Completion tracking
   - Statistics generation

## 🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
