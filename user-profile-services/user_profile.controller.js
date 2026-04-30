'use strict';

const prisma = require('../config/db');

// ─────────────────────────────────────────────
// USER PROFILE CONTROLLER
// ─────────────────────────────────────────────

/**
 * GET /api/users/profile/me
 * Fetch current user's profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Try to fetch profile joined with User for username, email, phone
    let result = await prisma.$queryRaw`
      SELECT
        up.*,
        u."username",
        u."email",
        u."phone"
      FROM "UserProfile" up
      JOIN "User" u ON up."userId" = u."id"
      WHERE up."userId" = ${userId} AND up."deleted" = false
      LIMIT 1
    `;

    // Auto-create a blank profile if none exists yet
    // (Auth service creates the User row but not UserProfile)
    if (!result || result.length === 0) {
      const newId = require('crypto').randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "UserProfile" ("id", "userId", "createdAt", "updatedAt")
        VALUES (${newId}, ${userId}, NOW(), NOW())
        ON CONFLICT ("userId") DO NOTHING
      `;

      // Re-fetch after insert with JOIN
      result = await prisma.$queryRaw`
        SELECT
          up.*,
          u."username",
          u."email",
          u."phone"
        FROM "UserProfile" up
        JOIN "User" u ON up."userId" = u."id"
        WHERE up."userId" = ${userId} AND up."deleted" = false
        LIMIT 1
      `;
    }

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: result[0],
    });
  } catch (err) {
    next(err);
  }

};

/**
 * PUT /api/users/profile
 * Update profile (name, bio, avatar, etc.)
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Extract potential fields from body
    const { name, bio, avatar, ...otherFields } = req.body;

    // First check if profile exists and is active
    const profileExists = await prisma.$queryRaw`
      SELECT "userId" FROM "UserProfile"
      WHERE "userId" = ${userId} AND "deleted" = false
      LIMIT 1
    `;

    if (!profileExists || profileExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or has been deleted.',
      });
    }

    // Build a dynamic SET clause for raw SQL
    // We only update fields that were actually provided in the request
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Combine expected and other potential profile fields
    const allFieldsToUpdate = { name, bio, avatar, ...otherFields };

    for (const [key, value] of Object.entries(allFieldsToUpdate)) {
      if (value !== undefined) {
        // Enclose column name in quotes to handle any case sensitivity/reserved keywords
        updates.push(`"${key}" = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updatable fields provided.',
      });
    }

    // Add userId for the WHERE clause
    values.push(userId);
    
    const setClause = updates.join(', ');
    const query = `
      UPDATE "UserProfile"
      SET ${setClause}
      WHERE "userId" = $${paramIndex} AND "deleted" = false
      RETURNING *
    `;

    // Use $queryRawUnsafe because column names and number of params are dynamic
    // The values are parameterized natively by Postgres, so it's safe from SQL injection
    const updatedResult = await prisma.$queryRawUnsafe(query, ...values);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedResult[0] || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/profile
 * Soft delete profile (set deleted = true)
 */
const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if profile exists and not already deleted
    const profileExists = await prisma.$queryRaw`
      SELECT "userId" FROM "UserProfile"
      WHERE "userId" = ${userId} AND "deleted" = false
      LIMIT 1
    `;

    if (!profileExists || profileExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or already deleted.',
      });
    }

    // Soft delete using raw SQL
    await prisma.$executeRaw`
      UPDATE "UserProfile"
      SET "deleted" = true
      WHERE "userId" = ${userId}
    `;

    return res.status(200).json({
      success: true,
      message: 'Profile soft-deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};
