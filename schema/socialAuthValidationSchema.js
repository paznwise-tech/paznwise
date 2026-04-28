'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────
// SOCIAL AUTH VALIDATION SCHEMA
// POST /api/auth/social
// ─────────────────────────────────────────────

const socialAuthValidationSchema = Joi.object({

  provider: Joi.string()
    .valid('google', 'facebook', 'apple')
    .required()
    .messages({
      'any.only':     'Provider must be either google, facebook, or apple.',
      'any.required': 'Provider is required.',
    }),

  token: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base':    'Token must be a string.',
      'any.required':   'OAuth token is required.',
    }),

  name: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max':     'Name cannot exceed 100 characters.',
    }),

});

module.exports = socialAuthValidationSchema;
