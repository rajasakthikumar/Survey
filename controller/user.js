const asyncHandler = require('../middleware/asyncHandler');
const formatResponse = require('../utils/formatResponse');

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  registerUser = asyncHandler(async (req, res, next) => {
    const userData = req.body;
    const { user, token } = await this.userService.registerUser(userData);

    res.status(201).json(formatResponse({ user, token }));
  });

  loginUser = asyncHandler(async (req, res, next) => {
    const userData = req.body;
    const { user, token } = await this.userService.loginUser(userData);

    res.status(200).json(formatResponse({ user, token }));
  });

  getCurrentUser = asyncHandler(async (req, res, next) => {
    const user = await this.userService.getUserById(req.user.id);

    res.status(200).json(formatResponse(user));
  });
}

module.exports = UserController;
