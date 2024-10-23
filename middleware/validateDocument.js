const CustomError = require('../utils/customError');

const validateDocument = (Model, filterFunction) => {
  return async (req, res, next) => {
    try {
      const filter = filterFunction(req);
      const document = await Model.findOne(filter);

      if (!document) {
        return next(new CustomError('Resource not found', 404));
      }

      req.document = document;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validateDocument;