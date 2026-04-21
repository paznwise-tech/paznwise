'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────
// LOGIN VALIDATION SCHEMA
// POST /api/auth/login
// ─────────────────────────────────────────────

const loginValidationSchema = Joi.object({

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email':   'Please provide a valid email address.',
      'string.base':    'Email must be a string.',
      'any.required':   'Email is required.',
    }),

  password: Joi.string()
    .min(8)
    .max(64)
    .required()
    .messages({
      'string.min':     'Password must be at least 8 characters long.',
      'string.max':     'Password must not exceed 64 characters.',
      'any.required':   'Password is required.',
    }),

});

module.exports = loginValidationSchema;
