'use strict';

const jwt = require('jsonwebtoken');

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

const TOKEN_ERRORS = {
  TokenExpiredError: {
    statusCode: 401,
    message: 'Access token has expired. Please login again.',
  },
  JsonWebTokenError: {
    statusCode: 401,
    message: 'Invalid access token. Authentication failed.',
  },
  NotBeforeError: {
    statusCode: 401,
    message: 'Token is not yet active.',
  },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Extracts Bearer token from the Authorization header.
 * Expected format: "Authorization: Bearer <token>"
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractBearerToken = (req) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return token && token.trim() !== '' ? token : null;
};

// ─────────────────────────────────────────────
// CORE: AUTHENTICATE
// ─────────────────────────────────────────────

/**
 * Middleware: Verifies JWT access token.
 * Attaches decoded user payload to req.user on success.
 *
 * Usage: router.get('/profile', authenticate, controller)
 */
const authenticate = (req, res, next) => {
  try {
    // 1. Ensure JWT secret is configured
    if (!JWT_ACCESS_SECRET) {
      console.error('[AuthMiddleware] JWT_ACCESS_SECRET is not set in environment.');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration. Please contact support.',
      });
    }

    // 2. Extract token from header
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is missing. Please provide a Bearer token.',
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    // 4. Attach user payload to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      isVerified: decoded.isVerified,
    };

    next();
  } catch (err) {
    const knownError = TOKEN_ERRORS[err.name];

    if (knownError) {
      return res.status(knownError.statusCode).json({
        success: false,
        message: knownError.message,
      });
    }

    // Unknown/unexpected error
    console.error('[AuthMiddleware] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to an internal error.',
    });
  }
};

// ─────────────────────────────────────────────
// RBAC: AUTHORIZE (Role-Based Access Control)
// ─────────────────────────────────────────────

/**
 * Middleware factory: Restricts route access to specific roles.
 * Must be used AFTER `authenticate`.
 *
 * @param {...string} allowedRoles - e.g. 'ADMIN', 'ARTIST', 'ORGANIZER', 'BUYER'
 * @returns {import('express').RequestHandler}
 *
 * Usage: router.delete('/event/:id', authenticate, authorize('ADMIN', 'ORGANIZER'), controller)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure authenticate was called before authorize
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User is not authenticated.',
      });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): [${allowedRoles.join(', ')}]. Your role: ${role}`,
      });
    }

    next();
  };
};

// ─────────────────────────────────────────────
// OPTIONAL: VERIFIED USER ONLY
// ─────────────────────────────────────────────

/**
 * Middleware: Ensures authenticated user has verified their account.
 * Must be used AFTER `authenticate`.
 *
 * Usage: router.post('/publish', authenticate, requireVerified, controller)
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User is not authenticated.',
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account is not verified. Please verify your account to access this resource.',
    });
  }

  next();
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  authenticate,
  authorize,
  requireVerified,
};
