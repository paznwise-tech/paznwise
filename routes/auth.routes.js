'use strict';

const express = require('express');
const router  = express.Router();

// ─────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────
const { signup } = require('../controllers/signup.controller');
const { login }  = require('../controllers/login.controller');

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
const { authenticate, authorize, requireVerified } = require('../middleware/authMiddleware');

const validate                 = require('../middleware/validate');
const signupValidationSchema   = require('../schema/signupValidationSchema');
const loginValidationSchema    = require('../schema/loginValidationSchema');

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
 * @route   POST /api/auth/login
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

