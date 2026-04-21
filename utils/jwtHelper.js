'use strict';

const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────
// JWT HELPER
// ─────────────────────────────────────────────

const ACCESS_SECRET  = process.env.JWT_SECRET;
const ACCESS_EXPIRY  = process.env.JWT_ACCESS_EXPIRES_IN  || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Signs a short-lived access token.
 * @param {{ id: string, email: string, role: string, isVerified: boolean }} payload
 * @returns {string} JWT access token
 */
const signAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};

/**
 * Signs a long-lived refresh token.
 * @param {{ id: string }} payload
 * @returns {string} JWT refresh token
 */
const signRefreshToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: REFRESH_EXPIRY });
};

/**
 * Verifies a token and returns the decoded payload.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws jwt.JsonWebTokenError | jwt.TokenExpiredError
 */
const verifyToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

module.exports = { signAccessToken, signRefreshToken, verifyToken };
