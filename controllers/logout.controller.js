'use strict';

const authService = require('../services/auth.service');

// ─────────────────────────────────────────────
// LOGOUT CONTROLLER
// POST /api/auth/logout
// ─────────────────────────────────────────────

/**
 * Handles user logout by revoking the refresh token.
 *
 * Flow:
 *  1. Extract refreshToken from validated body
 *  2. Delegate revocation to authService.logout()
 *  3. Return success message
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Logout successful. Session revoked.',
    });
  } catch (err) {
    // Pass to global error handler
    next(err);
  }
};

module.exports = { logout };
