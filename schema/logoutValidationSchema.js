'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────
// LOGOUT VALIDATION SCHEMA
// POST /api/auth/logout
// ─────────────────────────────────────────────

const logoutValidationSchema = Joi.object({

  refreshToken: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base':    'Refresh token must be a string.',
      'any.required':   'Refresh token is required to logout.',
    }),

});

module.exports = logoutValidationSchema;
