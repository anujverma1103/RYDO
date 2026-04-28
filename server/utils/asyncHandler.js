/**
 * Wraps an async Express handler and forwards rejected promises to next().
 *
 * @param {Function} handler - Async route handler.
 * @returns {Function}
 */
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = asyncHandler;
