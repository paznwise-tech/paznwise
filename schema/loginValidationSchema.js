'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────
// LOGIN VALIDATION SCHEMA
// POST /api/login
// ─────────────────────────────────────────────

const loginValidationSchema = Joi.object({

  identifier: Joi.string().trim().messages({
    'string.base': 'Identifier must be a string.',
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .messages({
      'string.email':   'Please provide a valid email address.',
      'string.base':    'Email must be a string.',
    }),

  username: Joi.string().trim().messages({
    'string.base': 'Username must be a string.',
  }),

  number: Joi.string().trim().messages({
    'string.base': 'Number must be a string.',
  }),

  phone: Joi.string().trim().messages({
    'string.base': 'Phone must be a string.',
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

}).or('identifier', 'email', 'username', 'number', 'phone');

module.exports = loginValidationSchema;
