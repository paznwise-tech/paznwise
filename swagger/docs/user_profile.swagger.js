'use strict';

// ─────────────────────────────────────────────────────────────
// SWAGGER DOCS — USER PROFILE MODULE
//
// Documents all user profile endpoints:
//   GET /api/users/profile/me    → Fetch current user profile
//   PUT /api/users/profile       → Update user profile
//   DELETE /api/users/profile    → Soft delete user profile
// ─────────────────────────────────────────────────────────────

// ═════════════════════════════════════════════
//  GET /api/users/profile/me
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/users/profile/me:
 *   get:
 *     tags: [Profile]
 *     summary: Fetch current user's profile
 *     description: |
 *       Retrieves the profile data of the currently authenticated user.
 *       The profile will only be returned if it is not marked as deleted.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                       nullable: true
 *                       description: "From User table"
 *                     email:
 *                       type: string
 *                       format: email
 *                       nullable: true
 *                       description: "From User table"
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       description: "From User table"
 *                     name:
 *                       type: string
 *                       nullable: true
 *                     bio:
 *                       type: string
 *                       nullable: true
 *                     website:
 *                       type: string
 *                       nullable: true
 *                     avatar:
 *                       type: string
 *                       nullable: true
 *                     instagram:
 *                       type: string
 *                       nullable: true
 *                     tiktok:
 *                       type: string
 *                       nullable: true
 *                     twitter:
 *                       type: string
 *                       nullable: true
 *                     facebook:
 *                       type: string
 *                       nullable: true
 *                     youtube:
 *                       type: string
 *                       nullable: true
 *                     linkedin:
 *                       type: string
 *                       nullable: true
 *                     city:
 *                       type: string
 *                       nullable: true
 *                     country:
 *                       type: string
 *                       nullable: true
 *                     category:
 *                       type: string
 *                       nullable: true
 *                     experience:
 *                       type: string
 *                       nullable: true
 *                     isPublic:
 *                       type: boolean
 *                     isVerified:
 *                       type: boolean
 *                       nullable: true
 *                     deleted:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found or deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Profile not found or has been deleted.
 *       500:
 *         description: Internal server error
 */

// ═════════════════════════════════════════════
//  PUT /api/users/profile
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     description: |
 *       Updates the profile details (e.g., name, bio, avatar) for the authenticated user.
 *       Only active (non-deleted) profiles can be updated.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               bio:
 *                 type: string
 *                 example: Software Engineer & Artist
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully.
 *                 data:
 *                   type: object
 *       400:
 *         description: No updatable fields provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: No updatable fields provided.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found or deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Profile not found or has been deleted.
 *       500:
 *         description: Internal server error
 */

// ═════════════════════════════════════════════
//  DELETE /api/users/profile
// ═════════════════════════════════════════════

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     tags: [Profile]
 *     summary: Soft delete user profile
 *     description: |
 *       Marks the currently authenticated user's profile as deleted (soft delete).
 *       Data is not permanently removed.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Profile soft-deleted successfully.
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Profile not found or already deleted.
 *       500:
 *         description: Internal server error
 */
