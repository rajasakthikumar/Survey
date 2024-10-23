const express = require('express');
const router = express.Router();
const UserService = require('../service/user');
const UserRepository = require('../repositories/user');
const UserController = require('../controller/user');
const authMiddleware = require('../middleware/auth');

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/me', authMiddleware, userController.getCurrentUser);

module.exports = router;
