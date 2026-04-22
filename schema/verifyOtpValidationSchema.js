'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────
// VERIFY OTP VALIDATION SCHEMA
// POST /api/verify-otp
//
// Accepts phone in:
//   - E.164 format: +919000000003
//   - Plain 10-digit: 9000000003
// ─────────────────────────────────────────────

const verifyOtpValidationSchema = Joi.object({

  phone: Joi.string()
    .trim()
    .required()
    .pattern(/^(\+[1-9]\d{6,14}|\d{10})$/)
    .messages({
      'string.pattern.base': 'Phone must be a valid 10-digit number or E.164 format (e.g. +919000000003).',
      'string.base':         'Phone must be a string.',
      'any.required':        'Phone number is required.',
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length':       'OTP must be exactly 6 digits.',
      'string.pattern.base': 'OTP must be a 6-digit number.',
      'any.required':        'OTP is required.',
    }),

});

module.exports = verifyOtpValidationSchema;
