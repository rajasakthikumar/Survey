const BaseService = require('./baseService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const CustomError = require('../utils/customError');

class UserService extends BaseService {
  constructor(userRepository) {
    super(userRepository);
  }

  async registerUser(userData) {
    const { username, email, password } = userData;

    let existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      throw new CustomError('User with this email already exists', 400);
    }

    existingUser = await this.repository.findByUsername(username);
    if (existingUser) {
      throw new CustomError('Username is already taken', 400);
    }

    const user = await this.repository.create({
      username,
      email,
      password
    });

    const token = jwt.sign(
      { id: user._id },
      keys.jwtSecret,
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async loginUser(userData) {
    const { email, password } = userData;

    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new CustomError('Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false }); 

    const token = jwt.sign(
      { id: user._id },
      keys.jwtSecret,
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async getUserById(userId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }
}

module.exports = UserService;