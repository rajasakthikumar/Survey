const CustomError = require('../utils/customError');

const checkOwnership = (modelName) => async (req, res, next) => {
  const Model = require(`../models/${modelName.toLowerCase()}`);
  const resource = await Model.findById(req.params.id);

  if (!resource) {
    throw new CustomError(`${modelName} not found`, 404);
  }

  if (resource.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new CustomError(`Not authorized to modify this ${modelName}`, 403);
  }

  req.resource = resource;
  next();
};

module.exports = checkOwnership;