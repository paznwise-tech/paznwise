'use strict';

const router = require('express').Router();
const { getFeedController } = require('./feed.controller');

/**
 * @openapi
 * /api/feed/{userId}:
 *   get:
 *     tags: [Feed]
 *     summary: Get personalised feed for a user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: diversity
 *         schema:
 *           type: boolean
 *           default: true
 *       - in: query
 *         name: excludeSeen
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Personalised feed returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FeedResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot fetch another user's feed
 *       500:
 *         description: Internal server error
 */
router.get('/:userId', getFeedController);

module.exports = router;
