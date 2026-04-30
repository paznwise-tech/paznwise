'use strict';

const express = require('express');
const userProfileController = require('./user_profile.controller');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// All profile routes require authentication
router.use(authenticate);

// ─────────────────────────────────────────────
// USER PROFILE ROUTES
// ─────────────────────────────────────────────

// GET /api/users/profile/me
router.get('/me', userProfileController.getProfile);

// PUT /api/users/profile
router.put('/', userProfileController.updateProfile);

// DELETE /api/users/profile
router.delete('/', userProfileController.deleteProfile);

module.exports = router;
