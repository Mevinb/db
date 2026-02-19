/**
 * Middleware Index
 * Central export for all middleware
 */

const { protect, authorize, optionalAuth } = require('./auth');
const { errorHandler, asyncHandler, notFound } = require('./errorHandler');
const { validate, validationRules } = require('./validation');

module.exports = {
  protect,
  authorize,
  optionalAuth,
  errorHandler,
  asyncHandler,
  notFound,
  validate,
  validationRules
};
