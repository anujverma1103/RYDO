const { validationResult } = require('express-validator');

/**
 * Sends a 422 response when express-validator finds invalid route input.
 *
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next callback.
 * @returns {void}
 */
const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: result.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg
      }))
    });
  }

  return next();
};

module.exports = validateRequest;
