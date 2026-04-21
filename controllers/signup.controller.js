'use strict';

const authService = require('../services/auth.service');

// ─────────────────────────────────────────────
// SIGNUP CONTROLLER
// POST /api/auth/signup
// ─────────────────────────────────────────────

/**
 * Handles new user registration.
 *
 * Flow:
 *  1. Extract validated body (validated by middleware/validate.js)
 *  2. Delegate business logic to authService.signup()
 *  3. Return standardized 201 response with tokens + user
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const signup = async (req, res, next) => {
  try {
    const { email, phone, password, role } = req.body;

    const result = await authService.signup({ email, phone, password, role });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    // Pass to global error handler (middleware/errorHandler.js)
    next(err);
  }
};

module.exports = { signup };
