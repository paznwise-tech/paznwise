'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

// ─────────────────────────────────────────────
// SWAGGER / OPENAPI 3.0 CONFIGURATION
// ─────────────────────────────────────────────

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'Paznwise API',
      version: '1.0.0',
      description: `
**Paznwise** — Enterprise-grade RESTful API for the Paznwise platform.

### Authentication Methods
- **Email + Password** — Classic credential-based authentication
- **Phone + OTP** — Mobile number verification with one-time password

### Token Strategy
- **Access Token** — Short-lived JWT (15 min) for API authorization
- **Refresh Token** — Long-lived JWT (7 days) stored in sessions table

### OTP Rules
- OTP is a **6-digit numeric** code
- Expires after **5 minutes**
- Maximum **5 verification attempts** per OTP
- Previous OTPs are **invalidated** when a new one is requested
- OTP is **hashed (bcrypt)** in the database — never stored in plain text
- In development, OTP is logged to the server console for testing
      `.trim(),
      contact: {
        name: 'Paznwise Team',
        email: 'support@paznwise.com',
      },
      license: {
        name: 'ISC',
      },
    },

    servers: [
      {
        url: 'https://paznwise.gujberry.com',
        description: 'Local Development Server',
      },
    ],

    // ── Tags ──
    tags: [
      {
        name: 'Auth',
        description: 'Authentication & Authorization — Signup, Login, OTP',
      },
      {
        name: 'Feed',
        description: 'Personalised content feed & user interactions',
      },
      {
        name: 'Profile',
        description: 'User Profile Management',
      },
    ],

    // ── Security Schemes ──
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token. Example: `eyJhbGciOi...`',
        },
      },

      // ── Reusable Schemas ──
      schemas: {

        // ─── User Model ───
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            email: { type: 'string', format: 'email', example: 'user@example.com', nullable: true },
            phone: { type: 'string', example: '+919000000003', nullable: true },
            role: { type: 'string', enum: ['ARTIST', 'BUYER', 'ORGANIZER', 'ADMIN'], example: 'BUYER' },
            provider: { type: 'string', enum: ['EMAIL', 'GOOGLE', 'FACEBOOK', 'OTP'], example: 'EMAIL' },
            isVerified: { type: 'boolean', example: false },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2026-04-22T06:30:00.000Z' },
          },
        },

        // ─── Auth Success Response ───
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful.' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },

        // ─── Success Message Response ───
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully.' },
          },
        },

        // ─── Error Response ───
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred.' },
          },
        },

        // ─── Validation Error Response ───
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed. Please check the errors below.' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Please provide a valid email address.' },
                },
              },
            },
          },
        },

        // ─── Feed Item ───
        FeedItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            artistId: { type: 'string' },
            template: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['product'] },
                    image: { type: 'string' },
                    height: { type: 'integer' },
                    price: { type: 'string' },
                    title: { type: 'string' },
                  },
                },
                {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['image'] },
                    image: { type: 'string' },
                    height: { type: 'integer' },
                  },
                },
              ],
            },
            category: { type: 'string' },
            style: { type: 'string', nullable: true },
            finalScore: { type: 'number' },
            likesCount: { type: 'integer' },
            savesCount: { type: 'integer' },
            commentsCount: { type: 'integer' },
            isPromoted: { type: 'boolean' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ─── Feed Response ───
        FeedResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/FeedItem' },
            },
            nextCursor: { type: 'string', nullable: true },
            meta: {
              type: 'object',
              properties: {
                coldStart: { type: 'boolean' },
                diversityScore: { type: 'number' },
                totalCandidates: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },

  // ── Where to find JSDoc annotations ──
  apis: ['./swagger/docs/*.js', './src/feed/*.js', './src/interact/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
