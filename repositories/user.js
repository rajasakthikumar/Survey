const User = require('../models/user');
const BaseRepository = require('./baseRepository');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByUsername(username) {
    return await this.model.findOne({ username });
  }
}

module.exports = UserRepository;
