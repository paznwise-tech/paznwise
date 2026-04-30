'use strict';

const router = require('express').Router();
const { recordInteractionController } = require('./interact.controller');

/**
 * @openapi
 * /api/interact:
 *   post:
 *     tags: [Feed]
 *     summary: Record a user interaction with a post
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - action
 *             properties:
 *               postId:
 *                 type: integer
 *               action:
 *                 type: string
 *                 enum: [like, save, share, view, purchase, skip]
 *     responses:
 *       200:
 *         description: Interaction recorded
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', recordInteractionController);

module.exports = router;
