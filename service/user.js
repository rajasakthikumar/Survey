const BaseService = require('./baseService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const CustomError = require('../utils/customError');

class UserService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async registerUser(userData) {
    const { username, password } = userData;
    let user = await this.repository.findByUsername(username);
    if (user) {
      throw new CustomError(`User with username ${username} already exists`, 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.repository.create({
      username,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id }, keys.jwtSecret, {
      expiresIn: '1d',
    });
    return { user: { id: newUser._id, username: newUser.username }, token };
  }

  async loginUser(userData) {
    const { username, password } = userData;
    let user = await this.repository.findByUsername(username);
    if (!user) {
      throw new CustomError('Invalid user details', 400);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError('Wrong password', 400);
    }
    const token = jwt.sign({ id: user._id }, keys.jwtSecret, { expiresIn: '1d' });
    return { user: { id: user._id, username: user.username }, token };
  }

  async getUserById(userId) {
    const user = await this.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    return user;
  }
}

module.exports = UserService;
