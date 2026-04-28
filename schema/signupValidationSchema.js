'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────
// SIGNUP VALIDATION SCHEMA
// POST /api/auth/signup
// ─────────────────────────────────────────────

const signupValidationSchema = Joi.object({

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address.',
      'string.base':  'Email must be a string.',
    }),

  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .trim()
    .optional()
    .messages({
      'string.pattern.base': 'Phone must be a valid international number (e.g. +919876543210).',
      'string.base':         'Phone must be a string.',
    }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .trim()
    .optional()
    .messages({
      'string.alphanum': 'Username must only contain alpha-numeric characters.',
      'string.min':      'Username must be at least 3 characters long.',
      'string.max':      'Username must not exceed 30 characters.',
      'string.base':     'Username must be a string.',
    }),

  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/)
    .required()
    .messages({
      'string.min':          'Password must be at least 8 characters long.',
      'string.max':          'Password must not exceed 64 characters.',
      'string.pattern.base': 'Password must contain uppercase, lowercase, a number, and a special character (@$!%*?&#).',
      'any.required':        'Password is required.',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match.',
      'any.required': 'Confirm password is required.',
    }),

  role: Joi.string()
    .valid('ARTIST', 'BUYER', 'ORGANIZER')
    .default('BUYER')
    .optional()
    .messages({
      'any.only': 'Role must be one of: ARTIST, BUYER, ORGANIZER.',
    }),

})
  // At least one of email, phone, or username must be provided
  .or('email', 'phone', 'username')
  .messages({
    'object.missing': 'Either email, phone number, or username is required.',
  });

module.exports = signupValidationSchema;
