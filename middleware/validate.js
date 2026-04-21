'use strict';

// ─────────────────────────────────────────────
// JOI VALIDATION MIDDLEWARE
// ─────────────────────────────────────────────

/**
 * Middleware factory that validates req.body against a Joi schema.
 * Returns 422 Unprocessable Entity with field-level error messages on failure.
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @returns {import('express').RequestHandler}
 *
 * Usage in routes:
 *   const validate = require('../middleware/validate');
 *   const signupValidationSchema = require('../schema/signupValidationSchema');
 *   router.post('/signup', validate(signupValidationSchema), signup);
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly:   false,  // collect ALL errors, not just the first
    stripUnknown: true,   // remove unknown fields from body
    convert:      true,   // auto-convert types (e.g. trim strings)
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field:   detail.context?.key || 'unknown',
      message: detail.message,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the errors below.',
      errors,
    });
  }

  // Replace req.body with sanitized + converted value
  req.body = value;
  next();
};

module.exports = validate;
