const express = require('express');
const router = express.Router();
const { responseValueController } = require('../bootstrap');
const protect = require('../middleware/auth');
const { validateDocument } = require('../middleware/validateDocument');
const ResponseValue = require('../models/responseValue');

router.post(
  '/',
  protect,
  responseValueController.createResponseValue
);

router.get(
  '/:id',
  protect,
  validateDocument(ResponseValue, (req) => ({ _id: req.params.id })),
  responseValueController.getResponseValueById
);

router.put(
  '/:id',
  protect,
  validateDocument(ResponseValue, (req) => ({ _id: req.params.id })),
  responseValueController.updateResponseValueById
);

router.delete(
  '/:id',
  protect,
  validateDocument(ResponseValue, (req) => ({ _id: req.params.id })),
  responseValueController.deleteResponseValueById
);

module.exports = router;
