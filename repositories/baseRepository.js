class BaseRepository {
    constructor(model) {
      this.model = model;
    }
  
    async create(data) {
      return await this.model.create(data);
    }
  
    async findById(id, populate = '') {
      return await this.model.findById(id).populate(populate);
    }
  
    async findOne(filter = {}, populate = '') {
      return await this.model.findOne(filter).populate(populate);
    }
  
    async find(filter = {}, options = {}) {
      const { sort = {}, populate = '', select = '', limit = 0, skip = 0 } = options;
      return await this.model
        .find(filter)
        .sort(sort)
        .populate(populate)
        .select(select)
        .limit(limit)
        .skip(skip)
        .lean();
    }
  
    async findAll(filter = {}, options = {}) {
      const { sort = {}, populate = '', limit = 0, skip = 0 } = options;
      return await this.model
        .find(filter)
        .sort(sort)
        .populate(populate)
        .limit(limit)
        .skip(skip)
        .lean();
    }
  
    async updateById(id, data) {
      return await this.model.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
    }
  
    async updateOne(filter, data) {
      return await this.model.findOneAndUpdate(
        filter,
        data,
        { new: true, runValidators: true }
      );
    }
  
    async updateMany(filter, data) {
      return await this.model.updateMany(filter, data);
    }
  
    async deleteById(id) {
      return await this.model.findByIdAndDelete(id);
    }
  
    async deleteMany(filter = {}) {
      return await this.model.deleteMany(filter);
    }
  
    async count(filter = {}) {
      return await this.model.countDocuments(filter);
    }
  }
  
  module.exports = BaseRepository;