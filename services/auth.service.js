'use strict';

const bcrypt    = require('bcryptjs');
const prisma    = require('../config/db');
const AppError  = require('../utils/AppError');
const { signAccessToken, signRefreshToken } = require('../utils/jwtHelper');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Fields to return for the user object — never expose passwordHash */
const USER_SAFE_FIELDS = {
  id:         true,
  email:      true,
  phone:      true,
  role:       true,
  provider:   true,
  isVerified: true,
  isActive:   true,
  createdAt:  true,
};

const getDeviceInfo = (req) => ({
  ip:        req?.ip || null,
  userAgent: req?.headers?.['user-agent'] || null,
});

// ─────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────

/**
 * Registers a new user with EMAIL provider.
 *
 * @param {{ email: string, phone?: string, password: string, role?: string }} data
 * @returns {{ user, accessToken, refreshToken }}
 * @throws {AppError}
 */
const signup = async ({ email, phone, password, role }) => {

  // 1. Check duplicate email
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }
  }

  // 2. Check duplicate phone
  if (phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      throw new AppError('An account with this phone number already exists.', 409);
    }
  }

  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // 4. Create user
  const user = await prisma.user.create({
    data: {
      email,
      phone:        phone || null,
      passwordHash,
      provider:     'EMAIL',
      role:         role || 'BUYER',
      isVerified:   false,
      isActive:     true,
    },
    select: USER_SAFE_FIELDS,
  });

  // 5. Sign tokens
  const tokenPayload = {
    id:         user.id,
    email:      user.email,
    role:       user.role,
    isVerified: user.isVerified,
  };
  const accessToken  = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ id: user.id });

  // 6. Persist refresh token in Session table
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.session.create({
    data: {
      userId:       user.id,
      refreshToken,
      expiresAt,
    },
  });

  return { user, accessToken, refreshToken };
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

/**
 * Authenticates a user with email + password.
 *
 * @param {{ email: string, password: string }} data
 * @returns {{ user, accessToken, refreshToken }}
 * @throws {AppError}
 */
const login = async ({ email, password }) => {

  // 1. Find user by email (include passwordHash for comparison)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...USER_SAFE_FIELDS, passwordHash: true },
  });

  // 2. User not found — use generic message to prevent user enumeration
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // 3. Check account is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  // 4. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  // 5. Strip passwordHash before returning
  const { passwordHash: _removed, ...safeUser } = user;

  // 6. Sign tokens
  const tokenPayload = {
    id:         safeUser.id,
    email:      safeUser.email,
    role:       safeUser.role,
    isVerified: safeUser.isVerified,
  };
  const accessToken  = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ id: safeUser.id });

  // 7. Persist new session
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.session.create({
    data: {
      userId:       safeUser.id,
      refreshToken,
      expiresAt,
    },
  });

  return { user: safeUser, accessToken, refreshToken };
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = { signup, login };
