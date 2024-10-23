const asyncHandler = require('../middleware/asyncHandler');
const formatResponse = require('../utils/formatResponse');

class BaseController {
  constructor(service) {
    this.service = service;
  }

  getAll = asyncHandler(async (req, res) => {
    const items = await this.service.findAll(req.query);
    res.status(200).json(formatResponse(items));
  });

  getById = asyncHandler(async (req, res) => {
    const item = await this.service.findById(req.params.id);
    res.status(200).json(formatResponse(item));
  });

  create = asyncHandler(async (req, res) => {
    const item = await this.service.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(formatResponse(item));
  });

  update = asyncHandler(async (req, res) => {
    const item = await this.service.updateById(req.params.id, {
      ...req.body,
      modifiedBy: req.user.id
    });
    res.status(200).json(formatResponse(item));
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.deleteById(req.params.id);
    res.status(200).json(formatResponse({ message: 'Resource deleted successfully' }));
  });
}

module.exports = BaseController;