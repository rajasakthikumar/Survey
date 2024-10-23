const BaseService = require('./baseService');
const CustomError = require('../utils/customError');

class ResponseValueService extends BaseService {
  constructor(responseValueRepository) {
    super(responseValueRepository);
 }

  async createResponseValue(data) {
    const responseValue = await this.create(data);
    return responseValue;
  }

  async getResponseValueById(responseValueId) {
    const responseValue = await this.findById(responseValueId);
    if (!responseValue) {
      throw new CustomError('Response Value not found', 404);
    }
    return responseValue;
  }

  async updateResponseValue(responseValueId, data) {
    const responseValue = await this.updateById(responseValueId, data);
    if (!responseValue) {
      throw new CustomError('Response Value not found', 404);
    }
    return responseValue;
  }

  async deleteResponseValue(responseValueId) {
    const responseValue = await this.deleteById(responseValueId);
    if (!responseValue) {
      throw new CustomError('Response Value not found', 404);
    }
    return responseValue;
  }

  async deleteMany(filter) {
    await this.repository.deleteMany(filter);
  }
}

module.exports = ResponseValueService;
