'use strict';

// ─────────────────────────────────────────────
// FEED SERVICE — 8-step scoring pipeline
// ─────────────────────────────────────────────

const pool = require('../../config/pool');
const cache = require('../../utils/cache');
const { ACTION_VALUE, blendAndRank } = require('./feed.scorer');
const diversifyFeed = require('./feed.diversity');
const getColdStartFeed = require('./feed.coldstart');

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Map a ScoredPost to a FeedItem for the API response.
 */
function mapToFeedItem(scoredPost) {
  const post = scoredPost.post;

  const template = post.price != null
    ? {
        type:        'product',
        image:       post.image_url,
        height:      post.height,
        price:       '₹' + Number(post.price).toLocaleString('en-IN'),
        title:       post.title,
        description: post.description,
      }
    : {
        type:        'image',
        image:       post.image_url,
        height:      post.height,
        title:       post.title,
        description: post.description,
      };

  return {
    id:             post.id,
    artistId:       post.artist_id,
    template,
    category:       post.category,
    style:          post.style,
    finalScore:     scoredPost.finalScore,
    scoreBreakdown: scoredPost.scoreBreakdown,
    likesCount:     post.likes_count,
    savesCount:     post.saves_count,
    commentsCount:  post.comments_count,
    isPromoted:     post.is_promoted,
    tags:           post.tags,
    createdAt:      post.created_at,
  };
}

// ─────────────────────────────────────────────
// MAIN PIPELINE
// ─────────────────────────────────────────────

/**
 * Get a personalised, ranked feed for a user.
 *
 * @param {object} options
 * @param {string} options.userId
 * @param {number} options.limit
 * @param {string|undefined} options.cursor
 * @param {boolean} options.diversity
 * @param {boolean} options.excludeSeen
 * @returns {Promise<{ items, nextCursor, meta }>}
 */
async function getFeed({ userId, limit, cursor, diversity, excludeSeen }) {

  // ── STEP 1: Load user profile ──
  const prefResult = await pool.query(
    'SELECT * FROM user_preferences WHERE user_id = $1',
    [userId]
  );
  const prefRow = prefResult.rows[0] || null;

  const followResult = await pool.query(
    'SELECT artist_id FROM artist_follows WHERE follower_id = $1',
    [userId]
  );
  const followedArtistIds = followResult.rows.map((r) => r.artist_id);

  const isNew = !prefRow;

  const userProfile = {
    likedCategories:  prefRow ? (prefRow.liked_categories || []) : [],
    likedStyles:      prefRow ? (prefRow.liked_styles || [])     : [],
    priceTierPref:    prefRow ? (prefRow.price_tier_pref || 'mid') : 'mid',
    followedArtistIds,
  };

  // ── STEP 2: Cold-start check ──
  if (isNew) {
    const coldResult = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT 500'
    );
    const coldPosts = coldResult.rows;
    const scored = getColdStartFeed(coldPosts, limit);
    const items = scored.map(mapToFeedItem);

    const nextCursor = items.length === limit
      ? String(items[items.length - 1].id)
      : null;

    const uniqueCategories = new Set(items.map((i) => i.category));
    const diversityScore = items.length > 0
      ? uniqueCategories.size / items.length
      : 0;

    return {
      items,
      nextCursor,
      meta: {
        coldStart: true,
        diversityScore,
        totalCandidates: coldPosts.length,
      },
    };
  }

  // ── STEP 3: Load seen post ids ──
  let seenIds = [];
  if (excludeSeen) {
    const seenResult = await pool.query(
      `SELECT DISTINCT post_id FROM interactions
       WHERE user_id = $1 AND action IN ('like','save','purchase','view')`,
      [userId]
    );
    seenIds = seenResult.rows.map((r) => r.post_id);
  }

  // ── STEP 4: Load candidate posts ──
  const candidateResult = await pool.query(
    `SELECT * FROM posts
     WHERE id != ALL($1::int[])
     AND ($2::int IS NULL OR id < $2)
     ORDER BY created_at DESC
     LIMIT 500`,
    [seenIds.length > 0 ? seenIds : '{}', cursor ? parseInt(cursor, 10) : null]
  );
  const candidatePosts = candidateResult.rows;

  // ── STEP 5: Load CF scores ──
  const cfCacheKey = `cf:scores:${userId}`;
  let cfScoreMap = {};
  const cached = cache.get(cfCacheKey);

  if (cached) {
    cfScoreMap = JSON.parse(cached);
  } else {
    // Find top 10 similar users
    const simResult = await pool.query(
      `SELECT i2.user_id,
              SUM(CASE i2.action
                WHEN 'like'     THEN 1.0
                WHEN 'save'     THEN 2.5
                WHEN 'share'    THEN 3.0
                WHEN 'view'     THEN 0.1
                WHEN 'purchase' THEN 5.0
                ELSE 0 END) AS sim_score
       FROM interactions i1
       JOIN interactions i2 ON i1.post_id = i2.post_id AND i2.user_id != $1
       WHERE i1.user_id = $1
       GROUP BY i2.user_id
       ORDER BY sim_score DESC
       LIMIT 10`,
      [userId]
    );
    const neighbourIds = simResult.rows.map((r) => r.user_id);

    if (neighbourIds.length > 0) {
      // Get all interactions from neighbours on candidate posts
      const candidatePostIds = candidatePosts.map((p) => p.id);

      if (candidatePostIds.length > 0) {
        const nInteractions = await pool.query(
          `SELECT post_id, action FROM interactions
           WHERE user_id = ANY($1::text[])
           AND post_id = ANY($2::int[])`,
          [neighbourIds, candidatePostIds]
        );

        // Sum action values per post, then average by neighbour count
        const postActionSums = {};
        for (const row of nInteractions.rows) {
          const val = ACTION_VALUE[row.action] || 0;
          postActionSums[row.post_id] = (postActionSums[row.post_id] || 0) + val;
        }

        const nCount = neighbourIds.length;
        for (const postId of Object.keys(postActionSums)) {
          cfScoreMap[postId] = postActionSums[postId] / nCount;
        }
      }
    }

    // Cache CF scores
    cache.set(cfCacheKey, JSON.stringify(cfScoreMap), 3600);
  }

  // Build cfScores array in same order as candidatePosts
  const cfScores = candidatePosts.map((p) => cfScoreMap[p.id] || 0);

  // ── STEP 6: Score and rank ──
  let ranked = blendAndRank(candidatePosts, userProfile, cfScores);

  if (diversity) {
    ranked = diversifyFeed(ranked, 3, limit);
  } else {
    ranked = ranked.slice(0, limit);
  }

  // ── STEP 7: Map to FeedItems ──
  const items = ranked.map(mapToFeedItem);

  // ── STEP 8: Build FeedResponse ──
  const nextCursor = items.length === limit
    ? String(items[items.length - 1].id)
    : null;

  const uniqueCategories = new Set(items.map((i) => i.category));
  const diversityScore = items.length > 0
    ? uniqueCategories.size / items.length
    : 0;

  return {
    items,
    nextCursor,
    meta: {
      coldStart: false,
      diversityScore,
      totalCandidates: candidatePosts.length,
    },
  };
}

module.exports = getFeed;
