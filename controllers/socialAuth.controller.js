'use strict';

const authService = require('../services/auth.service');

// ─────────────────────────────────────────────
// SOCIAL AUTH CONTROLLER
// POST /api/auth/social
// ─────────────────────────────────────────────

/**
 * Handles social login (Google/Facebook).
 * 
 * Flow:
 *  1. Extract provider and token from validated body
 *  2. Delegate authentication to authService.socialLogin()
 *  3. Return standardized 200 response with tokens + user
 * 
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const socialAuth = async (req, res, next) => {
  try {
    const { provider, token } = req.body;

    const result = await authService.socialLogin({ provider, token });

    return res.status(200).json({
      success: true,
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful.`,
      data: {
        user:         result.user,
        accessToken:  result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    // Structured logging for observability (optional: add logger here)
    console.error(`[SocialAuthController] Error during ${req.body?.provider} login:`, err.message);
    next(err);
  }
};

module.exports = { socialAuth };
