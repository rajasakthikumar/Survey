const BaseRepository = require('./baseRepository');
const ResponseValue = require('../models/responseValue');

class ResponseValueRepository extends BaseRepository {
  constructor() {
    super(ResponseValue);
  }
}

module.exports = ResponseValueRepository;

