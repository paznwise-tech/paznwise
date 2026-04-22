'use strict';

const crypto  = require('crypto');
const bcrypt  = require('bcryptjs');

// ─────────────────────────────────────────────
// OTP HELPER
// ─────────────────────────────────────────────

const OTP_LENGTH     = 6;
const OTP_EXPIRY_MIN = 5;      // OTP valid for 5 minutes
const MAX_ATTEMPTS   = 5;      // Max verification attempts per OTP

/**
 * Generates a cryptographically random numeric OTP.
 * @returns {string} 6-digit OTP string
 */
const generateOtp = () => {
  // Generate a random number between 100000 and 999999
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
};

/**
 * Hashes an OTP using bcrypt (same approach as passwords).
 * @param {string} otp - Plain-text OTP
 * @returns {Promise<string>} Hashed OTP
 */
const hashOtp = async (otp) => {
  return bcrypt.hash(otp, 10);
};

/**
 * Compares a plain-text OTP against its hash.
 * @param {string} otp     - Plain-text OTP from user
 * @param {string} otpHash - Stored hash
 * @returns {Promise<boolean>}
 */
const verifyOtpHash = async (otp, otpHash) => {
  return bcrypt.compare(otp, otpHash);
};

/**
 * Returns a Date object set to OTP_EXPIRY_MIN from now.
 * @returns {Date}
 */
const getOtpExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000);
};

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  getOtpExpiry,
  OTP_LENGTH,
  OTP_EXPIRY_MIN,
  MAX_ATTEMPTS,
};
