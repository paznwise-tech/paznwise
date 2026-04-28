'use strict';

// ─────────────────────────────────────────────────────────────
// SWAGGER DOCS — AUTH MODULE
//
// Documents all authentication endpoints:
//   POST /api/auth/signup       → Register new user
//   POST /api/auth/login        → Email + Password login
//   POST /api/auth/send-otp     → Send OTP to phone
//   POST /api/auth/verify-otp   → Verify OTP & login
// ─────────────────────────────────────────────────────────────

// ═════════════════════════════════════════════
//  POST /api/auth/signup
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account using the **EMAIL** provider.
 *       Returns JWT access & refresh tokens along with the user object.
 *
 *       **Validation Rules:**
 *       - `email` — Required, must be a valid email format
 *       - `password` — Required, minimum 8 characters, maximum 64
 *       - `phone` — Optional, must be a valid 10-digit number or E.164 format
 *       - `role` — Optional, defaults to `BUYER`
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: User's email address (must be unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 64
 *                 example: SecurePass@123
 *                 description: Password (min 8 chars, max 64)
 *               phone:
 *                 type: string
 *                 example: "9000000003"
 *                 description: "Phone number — 10-digit or E.164 format (+919000000003)"
 *               role:
 *                 type: string
 *                 enum: [ARTIST, BUYER, ORGANIZER, ADMIN]
 *                 default: BUYER
 *                 example: BUYER
 *                 description: User role (defaults to BUYER)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Signup successful.
 *               data:
 *                 user:
 *                   id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                   email: user@example.com
 *                   phone: "+919000000003"
 *                   role: BUYER
 *                   provider: EMAIL
 *                   isVerified: false
 *                   isActive: true
 *                   createdAt: "2026-04-22T06:30:00.000Z"
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       409:
 *         description: Email or phone already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An account with this email already exists.
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An unexpected error occurred.
 */

// ═════════════════════════════════════════════
//  POST /api/auth/social
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/auth/social:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate via Google, Facebook, or Apple
 *     description: |
 *       Authenticates a user using **OAuth 2.0** tokens from Google, Facebook, or Apple.
 *       - If the user exists and is linked to the provider → Login
 *       - If the user exists (email match) but not linked → Link provider and login
 *       - If the user does not exist → Create new account and login
 *
 *       **Requirements:**
 *       - Google: Pass an \`id_token\`
 *       - Facebook: Pass an \`access_token\`
 *       - Apple: Pass an \`identityToken\` (JWT)
 *
 *       **Note on Apple**: Apple only provides the user's name on the *first* sign-in.
 *       The client should capture this and pass it in the \`name\` field if available.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - token
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [google, facebook, apple]
 *                 example: google
 *               token:
 *                 type: string
 *                 description: "OAuth 2.0 token (id_token for Google/Apple, access_token for Facebook)"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: "Optional: User's full name (important for first-time Apple sign-in)"
 *     responses:
 *       200:
 *         description: Social login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid OAuth token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

// ═════════════════════════════════════════════
//  POST /api/auth/login
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email & password
 *     description: |
 *       Authenticates a user using **email and password**.
 *       Returns JWT access & refresh tokens along with the user object.
 *
 *       **Validation Rules:**
 *       - `email` — Required, valid email format
 *       - `password` — Required, min 8, max 64 characters
 *
 *       **Security:**
 *       - Passwords are hashed with bcrypt (12 rounds)
 *       - Generic error messages prevent user enumeration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 64
 *                 example: SecurePass@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Login successful.
 *               data:
 *                 user:
 *                   id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                   email: user@example.com
 *                   phone: null
 *                   role: BUYER
 *                   provider: EMAIL
 *                   isVerified: false
 *                   isActive: true
 *                   createdAt: "2026-04-22T06:30:00.000Z"
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Invalid email or password.
 *       403:
 *         description: Account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Your account has been deactivated. Please contact support.
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// ═════════════════════════════════════════════
//  POST /api/auth/send-otp
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP to phone number
 *     description: |
 *       Generates a **6-digit OTP** and sends it to the provided phone number.
 *       If no user exists with this phone, a new account is auto-created with `OTP` provider.
 *
 *       **OTP Rules:**
 *       - OTP is a 6-digit numeric code
 *       - Expires after **5 minutes**
 *       - Previous unexpired OTPs are **invalidated** when a new one is generated
 *       - OTP is **bcrypt-hashed** before storage (never stored in plain text)
 *       - In development, OTP is **logged to the server console** for testing
 *
 *       **Rate Limiting (planned):**
 *       - Max 5 OTP requests per phone per 15 minutes
 *       - Max 10 OTP requests per IP per hour
 *
 *       **Validation Rules:**
 *       - `phone` — Required, 10-digit number or E.164 format (+919000000003)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9000000003"
 *                 description: "Phone number — 10-digit or E.164 format (+919000000003)"
 *           examples:
 *             plain_number:
 *               summary: 10-digit phone number
 *               value:
 *                 phone: "9000000003"
 *             e164_format:
 *               summary: E.164 format with country code
 *               value:
 *                 phone: "+919000000003"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "OTP sent to 9000000003. It will expire in 5 minutes."
 *               otp: "123456"
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             example:
 *               success: false
 *               message: Validation failed. Please check the errors below.
 *               errors:
 *                 - field: phone
 *                   message: "Phone must be a valid 10-digit number or E.164 format (e.g. +919000000003)."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// ═════════════════════════════════════════════
//  POST /api/auth/verify-otp
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and login
 *     description: |
 *       Verifies the OTP for a phone number and authenticates the user.
 *       Returns JWT access & refresh tokens along with the user object.
 *
 *       **Verification Rules:**
 *       - OTP must match the latest unexpired, unverified OTP for the phone
 *       - Maximum **5 verification attempts** per OTP
 *       - After 5 failed attempts, the OTP is auto-expired — request a new one
 *       - Once verified, the OTP is **invalidated** (single-use)
 *       - User's `isVerified` flag is set to `true` on first successful OTP verification
 *
 *       **Validation Rules:**
 *       - `phone` — Required, 10-digit number or E.164 format
 *       - `otp` — Required, exactly 6 digits
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9000000003"
 *                 description: "Phone number used to request OTP"
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: '^\d{6}$'
 *                 example: "123456"
 *                 description: "6-digit OTP received (check server console in dev)"
 *     responses:
 *       200:
 *         description: OTP verified, login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: OTP verified. Login successful.
 *               data:
 *                 user:
 *                   id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                   email: null
 *                   phone: "9000000003"
 *                   role: BUYER
 *                   provider: OTP
 *                   isVerified: true
 *                   isActive: true
 *                   createdAt: "2026-04-22T06:30:00.000Z"
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: OTP expired or not requested
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: OTP has expired or was not requested. Please request a new OTP.
 *       401:
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid OTP. 4 attempt(s) remaining."
 *       429:
 *         description: Maximum OTP attempts exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Maximum OTP attempts exceeded. Please request a new OTP.
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// ═════════════════════════════════════════════
//  POST /api/auth/logout
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke session
 *     description: |
 *       Revokes the user's session by deleting the provided **refresh token** from the database.
 *       Once revoked, the refresh token can no longer be used to obtain new access tokens.
 *
 *       **Security:**
 *       - Requires a valid **JWT Access Token** in the \`Authorization\` header.
 *       - The \`refreshToken\` must be provided in the request body.
 *
 *       **Validation Rules:**
 *       - \`refreshToken\` — Required, must be a valid token string.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 description: "The refresh token to be revoked."
 *     responses:
 *       200:
 *         description: Logout successful, session revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Logout successful. Session revoked."
 *       400:
 *         description: Invalid or already revoked refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid or already revoked refresh token."
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error - Refresh token missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 */
