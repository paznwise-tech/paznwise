'use strict';

const authService = require('../services/auth.service');

// ─────────────────────────────────────────────
// SEND OTP CONTROLLER
// POST /api/send-otp
// ─────────────────────────────────────────────

/**
 * Generates and sends OTP to the given phone number.
 * OTP is logged to console for development testing.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const result = await authService.sendOtp({ phone });

    return res.status(200).json({
      success: true,
      message: result.message,
      otp:     result.otp,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// VERIFY OTP CONTROLLER
// POST /api/verify-otp
// ─────────────────────────────────────────────

/**
 * Verifies OTP for the given phone number.
 * On success, returns JWT tokens + user details.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const result = await authService.verifyOtp({ phone, otp });

    return res.status(200).json({
      success: true,
      message: 'OTP verified. Login successful.',
      data: {
        user:         result.user,
        accessToken:  result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendOtp, verifyOtp };
