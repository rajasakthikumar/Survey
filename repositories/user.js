const BaseRepository = require('./baseRepository');
const User = require('../models/user');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByUsername(username) {
    return await this.model.findOne({ username }).select('+password');
  }

  async findByEmail(email) {
    return await this.model.findOne({ email }).select('+password');
  }
}

module.exports = UserRepository
