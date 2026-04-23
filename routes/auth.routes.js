'use strict';

const express = require('express');
const router  = express.Router();

// ─────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────
const { signup }              = require('../controllers/signup.controller');
const { login }               = require('../controllers/login.controller');
const { sendOtp, verifyOtp }  = require('../controllers/otp.controller');
const { logout }              = require('../controllers/logout.controller');

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
const { authenticate, authorize, requireVerified } = require('../middleware/authMiddleware');

const validate                     = require('../middleware/validate');
const signupValidationSchema       = require('../schema/signupValidationSchema');
const loginValidationSchema        = require('../schema/loginValidationSchema');
const sendOtpValidationSchema      = require('../schema/sendOtpValidationSchema');
const verifyOtpValidationSchema    = require('../schema/verifyOtpValidationSchema');
const logoutValidationSchema       = require('../schema/logoutValidationSchema');

// Pending — uncomment when ready:
// const rateLimiter = require('../middleware/rateLimiter');

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// No authentication required
// Chain: [rateLimiter] → [validate] → controller
// ─────────────────────────────────────────────

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (EMAIL provider)
 * @access  Public
 * @body    { email, phone, password, role }
 */
router.post(
  '/signup',
  // rateLimiter,                          // ← coming soon
  validate(signupValidationSchema),         //  Joi validation active
  signup                                    // controller
);

/**
 * @route   POST /api/login
 * @desc    Login with email & password
 * @access  Public
 * @body    { email, password }
 */
router.post(
  '/login',
  // rateLimiter,                          // ← coming soon
  validate(loginValidationSchema),          //  Joi validation active
  login                                     // controller
);

/**
 * @route   POST /api/send-otp
 * @desc    Send OTP to phone number for authentication
 * @access  Public
 * @body    { phone }
 */
router.post(
  '/send-otp',
  // rateLimiter,                          // ← coming soon
  validate(sendOtpValidationSchema),        //  Joi validation active
  sendOtp                                   // controller
);

/**
 * @route   POST /api/verify-otp
 * @desc    Verify OTP and login with phone number
 * @access  Public
 * @body    { phone, otp }
 */
router.post(
  '/verify-otp',
  // rateLimiter,                          // ← coming soon
  validate(verifyOtpValidationSchema),      //  Joi validation active
  verifyOtp                                 // controller
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout and revoke refresh token
 * @access  Private (Requires Bearer Token)
 * @body    { refreshToken }
 */
router.post(
  '/logout',
  authenticate,                             // Must be logged in to logout
  validate(logoutValidationSchema),         // Check refreshToken in body
  logout                                    // controller
);

// ─────────────────────────────────────────────
// PROTECTED ROUTE EXAMPLES
// These show how authenticate + authorize are used
// Actual route handlers will be added in future modules
// ─────────────────────────────────────────────

// router.get('/me',       authenticate,                          getProfile);
// router.patch('/me',     authenticate, requireVerified,         updateProfile);
// router.get('/admin',    authenticate, authorize('ADMIN'),      adminOnly);
// router.get('/artists',  authenticate, authorize('ADMIN', 'ORGANIZER'), listArtists);

module.exports = router;

