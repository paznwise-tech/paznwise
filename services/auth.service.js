'use strict';

const bcrypt    = require('bcryptjs');
const prisma    = require('../config/db');
const AppError  = require('../utils/AppError');
const { signAccessToken, signRefreshToken } = require('../utils/jwtHelper');
const {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  getOtpExpiry,
  MAX_ATTEMPTS,
  OTP_EXPIRY_MIN,
} = require('../utils/otpHelper');

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

/**
 * Creates a session and returns tokens for the given user.
 * Shared between login and OTP verify flows.
 *
 * @param {object} user - Safe user object (no passwordHash)
 * @returns {{ user, accessToken, refreshToken }}
 */
const createSessionAndTokens = async (user) => {
  const tokenPayload = {
    id:         user.id,
    email:      user.email,
    role:       user.role,
    isVerified: user.isVerified,
  };
  const accessToken  = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken({ id: user.id });

  // Persist refresh token in Session table
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

  // 5. Sign tokens & create session
  return createSessionAndTokens(user);
};

// ─────────────────────────────────────────────
// LOGIN (Email + Password)
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

  // 6. Sign tokens & create session
  return createSessionAndTokens(safeUser);
};

// ─────────────────────────────────────────────
// SEND OTP (Phone)
// ─────────────────────────────────────────────

/**
 * Generates and stores an OTP for the given phone number.
 * If no user exists with this phone, one is auto-created (OTP provider).
 *
 * In development, the OTP is logged to the console for testing.
 *
 * @param {{ phone: string }} data
 * @returns {{ message: string }}
 * @throws {AppError}
 */
const sendOtp = async ({ phone }) => {

  // 1. Invalidate all previous unexpired OTPs for this phone
  await prisma.otpVerification.updateMany({
    where: {
      phone,
      verifiedAt: null,
      expiresAt:  { gt: new Date() },
    },
    data: {
      expiresAt: new Date(),  // expire them immediately
    },
  });

  // 2. Generate new OTP
  const otp     = generateOtp();
  const otpHash = await hashOtp(otp);

  // 3. Find or auto-create user for this phone
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        provider:   'OTP',
        role:       'BUYER',
        isVerified: false,
        isActive:   true,
      },
    });
  }

  // 4. Store OTP record
  await prisma.otpVerification.create({
    data: {
      phone,
      userId:    user.id,
      otpHash,
      expiresAt: getOtpExpiry(),
    },
  });

  // 5. Log OTP to console for testing (DEVELOPMENT ONLY)
  console.log(`\n🔑 OTP for ${phone} is ${otp}\n`);

  return {
    message: `OTP sent to ${phone}. It will expire in ${OTP_EXPIRY_MIN} minutes.`,
  };
};

// ─────────────────────────────────────────────
// VERIFY OTP (Phone + OTP → Login)
// ─────────────────────────────────────────────

/**
 * Verifies the OTP for a phone number and returns tokens on success.
 *
 * @param {{ phone: string, otp: string }} data
 * @returns {{ user, accessToken, refreshToken }}
 * @throws {AppError}
 */
const verifyOtp = async ({ phone, otp }) => {

  // 1. Find the latest unexpired, unverified OTP for this phone
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      phone,
      verifiedAt: null,
      expiresAt:  { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw new AppError('OTP has expired or was not requested. Please request a new OTP.', 400);
  }

  // 2. Check max attempts
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    // Expire this OTP so it can't be tried again
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data:  { expiresAt: new Date() },
    });
    throw new AppError('Maximum OTP attempts exceeded. Please request a new OTP.', 429);
  }

  // 3. Increment attempt counter
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data:  { attempts: { increment: 1 } },
  });

  // 4. Verify OTP hash
  const isValid = await verifyOtpHash(otp, otpRecord.otpHash);
  if (!isValid) {
    const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
    throw new AppError(
      `Invalid OTP. ${remaining} attempt(s) remaining.`,
      401,
    );
  }

  // 5. Mark OTP as verified
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data:  { verifiedAt: new Date() },
  });

  // 6. Get user & check active status
  const user = await prisma.user.findUnique({
    where: { phone },
    select: USER_SAFE_FIELDS,
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  // 7. Mark user as verified (phone verified via OTP)
  if (!user.isVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data:  { isVerified: true },
    });
    user.isVerified = true;
  }

  // 8. Sign tokens & create session
  return createSessionAndTokens(user);
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = { signup, login, sendOtp, verifyOtp };
