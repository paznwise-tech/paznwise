'use strict';

const Joi = require('joi');

// ─────────────────────────────────────────────
// SEND OTP VALIDATION SCHEMA
// POST /api/send-otp
//
// Accepts phone in:
//   - E.164 format: +919000000003
//   - Plain 10-digit: 9000000003
// ─────────────────────────────────────────────

const sendOtpValidationSchema = Joi.object({

  phone: Joi.string()
    .trim()
    .required()
    .pattern(/^(\+[1-9]\d{6,14}|\d{10})$/)
    .messages({
      'string.pattern.base': 'Phone must be a valid 10-digit number or E.164 format (e.g. +919000000003).',
      'string.base':         'Phone must be a string.',
      'any.required':        'Phone number is required.',
    }),

});

module.exports = sendOtpValidationSchema;
