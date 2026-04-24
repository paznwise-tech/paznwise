'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────
// SOCIAL AUTH VALIDATION SCHEMA
// POST /api/auth/social
// ─────────────────────────────────────────────

const socialAuthValidationSchema = Joi.object({

  provider: Joi.string()
    .valid('google', 'facebook')
    .required()
    .messages({
      'any.only':     'Provider must be either google or facebook.',
      'any.required': 'Provider is required.',
    }),

  token: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base':    'Token must be a string.',
      'any.required':   'OAuth token is required.',
    }),

});

module.exports = socialAuthValidationSchema;
