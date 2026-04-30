'use strict';

// ─────────────────────────────────────────────
// INTERACT SERVICE
// Records user interactions and updates counters
// ─────────────────────────────────────────────

const pool = require('../../config/pool');
const cache = require('../../utils/cache');

const COUNTER_COLUMN = {
  like:     'likes_count',
  save:     'saves_count',
  view:     'views_count',
  share:    'shares_count',
  purchase: 'purchases_count',
};

/**
 * Record a user interaction with a post.
 *
 * @param {string} userId
 * @param {number} postId
 * @param {string} action - one of: like, save, share, view, purchase, skip
 */
async function recordInteraction(userId, postId, action) {
  // 1. Insert interaction row
  await pool.query(
    'INSERT INTO interactions (user_id, post_id, action) VALUES ($1, $2, $3)',
    [userId, postId, action]
  );

  // 2. Increment matching counter on posts (skip has no counter)
  const column = COUNTER_COLUMN[action];
  if (column) {
    await pool.query(
      `UPDATE posts SET ${column} = ${column} + 1, updated_at = NOW() WHERE id = $1`,
      [postId]
    );
  }

  // 3. Invalidate caches
  cache.del(`cf:scores:${userId}`);
  cache.del(`feed:${userId}`);
}

module.exports = { recordInteraction };
