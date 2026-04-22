'use strict';

const authService = require('../services/auth.service');

// ─────────────────────────────────────────────
// LOGIN CONTROLLER
// POST /api/login
// ─────────────────────────────────────────────

/**
 * Handles user login with email + password.
 *
 * Flow:
 *  1. Extract validated body (validated by middleware/validate.js)
 *  2. Delegate business logic to authService.login()
 *  3. Return standardized 200 response with tokens + user
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
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

module.exports = { login };
