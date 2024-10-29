// service/baseService.js
const CustomError = require('../utils/customError');
const mongoose = require('mongoose');

class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    try {
      const item = await this.repository.create(data);
      if (!item) {
        throw new CustomError('Failed to create resource', 400);
      }
      return item;
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError('Resource with this identifier already exists', 400);
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error creating resource: ${error.message}`, 500);
    }
  }

  async findById(id, populate = '') {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid ID format', 400);
      }

      const item = await this.repository.findById(id, populate);
      if (!item) {
        throw new CustomError('Resource not found', 404);
      }
      return item;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error retrieving resource: ${error.message}`, 500);
    }
  }

  async findAll(filter = {}, options = {}) {
    try {
      const items = await this.repository.findAll(filter, options);
      return items;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error retrieving resources: ${error.message}`, 500);
    }
  }

  async updateById(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid ID format', 400);
      }

      const item = await this.repository.updateById(id, data);
      if (!item) {
        throw new CustomError('Resource not found', 404);
      }
      return item;
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError('Resource with this identifier already exists', 400);
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error updating resource: ${error.message}`, 500);
    }
  }

  async deleteById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError('Invalid ID format', 400);
      }

      const item = await this.repository.deleteById(id);
      if (!item) {
        throw new CustomError('Resource not found', 404);
      }
      return item;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error deleting resource: ${error.message}`, 500);
    }
  }

  async findOne(filter = {}, populate = '') {
    try {
      const item = await this.repository.findOne(filter, populate);
      if (!item) {
        throw new CustomError('Resource not found', 404);
      }
      return item;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error finding resource: ${error.message}`, 500);
    }
  }

  async count(filter = {}) {
    try {
      return await this.repository.count(filter);
    } catch (error) {
      throw new CustomError(`Error counting resources: ${error.message}`, 500);
    }
  }

  async exists(filter = {}) {
    try {
      const count = await this.repository.count(filter);
      return count > 0;
    } catch (error) {
      throw new CustomError(`Error checking resource existence: ${error.message}`, 500);
    }
  }

  async findOneOrCreate(filter = {}, data = {}) {
    try {
      let item = await this.repository.findOne(filter);
      if (!item) {
        item = await this.repository.create({ ...data, ...filter });
      }
      return item;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error finding or creating resource: ${error.message}`, 500);
    }
  }

  async updateOne(filter = {}, data) {
    try {
      const item = await this.repository.updateOne(filter, data);
      if (!item) {
        throw new CustomError('Resource not found', 404);
      }
      return item;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error updating resource: ${error.message}`, 500);
    }
  }

  async deleteOne(filter = {}) {
    try {
      const item = await this.repository.deleteOne(filter);
      if (!item) {
        throw new CustomError('Resource not found', 404);
      }
      return item;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Error deleting resource: ${error.message}`, 500);
    }
  }
}

module.exports = BaseService;