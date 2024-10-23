const asyncHandler = require('../middleware/asyncHandler');
const formatResponse = require('../utils/formatResponse');

class ResponseValueController {
  constructor(responseValueService) {
    this.responseValueService = responseValueService;
  }

  createResponseValue = asyncHandler(async (req, res, next) => {
    const data = {
      ...req.body,
      questionId: req.params.questionId,
      createdBy: req.user.id,
    };

    const responseValue = await this.responseValueService.createResponseValue(data);

    res.status(201).json(formatResponse(responseValue));
  });

  getResponseValueById = asyncHandler(async (req, res, next) => {
    const responseValue = await this.responseValueService.getResponseValueById(req.params.id);

    res.status(200).json(formatResponse(responseValue));
  });

  updateResponseValueById = asyncHandler(async (req, res, next) => {
    const data = {
      ...req.body,
      modifiedBy: req.user.id,
    };

    const responseValue = await this.responseValueService.updateResponseValue(req.params.id, data);

    res.status(200).json(formatResponse(responseValue));
  });

  deleteResponseValueById = asyncHandler(async (req, res, next) => {
    await this.responseValueService.deleteResponseValue(req.params.id);

    res.status(200).json(formatResponse({ message: 'Response value deleted successfully' }));
  });
}

module.exports = ResponseValueController;
