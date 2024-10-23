const express = require('express');
const router = express.Router();
const { userController } = require('../bootstrap');
const auth = require('../middleware/auth');
const { 
  validateUserRegister, 
  validateUserLogin 
} = require('../middleware/validation');

router.post('/register', validateUserRegister, userController.registerUser);
router.post('/login', validateUserLogin, userController.loginUser);
router.get('/me', auth, userController.getCurrentUser);

module.exports = router;