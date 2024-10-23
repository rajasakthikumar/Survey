const CustomError = require('../utils/customError');

class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async findById(id, populate = '') {
    const item = await this.repository.findById(id, populate);
    if (!item) {
      throw new CustomError('Resource not found', 404);
    }
    return item;
  }

  async findAll(filter = {}, options = {}) {
    return await this.repository.findAll(filter, options);
  }

  async updateById(id, data) {
    const item = await this.repository.updateById(id, data);
    if (!item) {
      throw new CustomError('Resource not found', 404);
    }
    return item;
  }

  async deleteById(id) {
    const item = await this.repository.deleteById(id);
    if (!item) {
      throw new CustomError('Resource not found', 404);
    }
    return item;
  }
}

module.exports = BaseService;