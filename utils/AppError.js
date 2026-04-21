'use strict';

// ─────────────────────────────────────────────
// CUSTOM APPLICATION ERROR CLASS
// ─────────────────────────────────────────────

class AppError extends Error {
  /**
   * @param {string} message    - Human-readable error message
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 500...)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marks this as a known, handled error (not a bug)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
