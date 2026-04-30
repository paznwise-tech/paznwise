'use strict';

// ─────────────────────────────────────────────
// FEED CONTROLLER
// GET /api/feed/:userId
// ─────────────────────────────────────────────

const getFeed = require('./feed.service');

const getFeedController = async (req, res, next) => {
  try {
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 50) limit = 50;

    const cursor = req.query.cursor || undefined;
    const diversity = req.query.diversity !== 'false';
    const excludeSeen = req.query.excludeSeen !== 'false';
    const userId = req.params.userId;

    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only fetch your own feed',
      });
    }

    const feedResponse = await getFeed({ userId, limit, cursor, diversity, excludeSeen });

    return res.status(200).json({
      success: true,
      message: 'Feed fetched',
      data: feedResponse,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFeedController };
