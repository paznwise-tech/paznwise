'use strict';

// ─────────────────────────────────────────────
// FEED SCORER — Pure functions, no DB, no side effects
// ─────────────────────────────────────────────

const BLEND_WEIGHTS = {
  content:    0.35,
  cf:         0.25,
  engagement: 0.20,
  recency:    0.15,
  promoted:   0.05,
};

const ENGAGEMENT_WEIGHTS = {
  likes:     1.0,
  saves:     2.5,
  shares:    3.0,
  comments:  1.5,
  views:     0.05,
  purchases: 10.0,
};

const ACTION_VALUE = {
  like:     1.0,
  save:     2.5,
  share:    3.0,
  view:     0.1,
  purchase: 5.0,
  skip:    -0.5,
};

// ─────────────────────────────────────────────
// SCORING FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Weighted sum of engagement metrics on a post.
 *
 * @param {object} post - Must have likes_count, saves_count, shares_count,
 *                        comments_count, views_count, purchases_count
 * @returns {number}
 */
function engagementScore(post) {
  return (
    (post.likes_count     || 0) * ENGAGEMENT_WEIGHTS.likes +
    (post.saves_count     || 0) * ENGAGEMENT_WEIGHTS.saves +
    (post.shares_count    || 0) * ENGAGEMENT_WEIGHTS.shares +
    (post.comments_count  || 0) * ENGAGEMENT_WEIGHTS.comments +
    (post.views_count     || 0) * ENGAGEMENT_WEIGHTS.views +
    (post.purchases_count || 0) * ENGAGEMENT_WEIGHTS.purchases
  );
}

/**
 * Exponential decay based on post age.
 *
 * @param {object} post - Must have created_at (ISO timestamp)
 * @param {number} [halfLifeHours=24]
 * @returns {number} Value in (0, 1]
 */
function recencyScore(post, halfLifeHours = 24) {
  const ageHours = (Date.now() - new Date(post.created_at).getTime()) / 3_600_000;
  return Math.exp(-Math.log(2) * ageHours / halfLifeHours);
}

/**
 * How well a post matches a user's taste profile.
 *
 * @param {object} userProfile
 * @param {string[]} userProfile.likedCategories
 * @param {string[]} userProfile.likedStyles
 * @param {string}   userProfile.priceTierPref
 * @param {string[]} userProfile.followedArtistIds
 * @param {object} post
 * @returns {number}
 */
function contentMatchScore(userProfile, post) {
  let score = 0;
  if (userProfile.likedCategories && userProfile.likedCategories.includes(post.category)) {
    score += 1.0;
  }
  if (post.style && userProfile.likedStyles && userProfile.likedStyles.includes(post.style)) {
    score += 0.8;
  }
  if (post.price_tier && post.price_tier === userProfile.priceTierPref) {
    score += 0.5;
  }
  if (userProfile.followedArtistIds && userProfile.followedArtistIds.includes(post.artist_id)) {
    score += 1.5;
  }
  return score;
}

/**
 * Normalise an array of numbers to [0, 1].
 * If max === min, returns an array of zeros.
 *
 * @param {number[]} arr
 * @returns {number[]}
 */
function minMaxNormalize(arr) {
  if (!arr.length) return [];
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (max === min) return arr.map(() => 0);
  return arr.map((v) => (v - min) / (max - min));
}

/**
 * Blend all scoring signals and return ranked ScoredPost array.
 *
 * @param {object[]} posts         - Array of post rows
 * @param {object}   userProfile   - User preference profile
 * @param {number[]} cfScores      - CF scores, same length/order as posts
 * @returns {{ post, finalScore, scoreBreakdown }[]}
 */
function blendAndRank(posts, userProfile, cfScores) {
  if (!posts.length) return [];

  // 1. Compute raw arrays
  const contentArr    = posts.map((p) => contentMatchScore(userProfile, p));
  const engagementArr = posts.map((p) => engagementScore(p));
  const recencyArr    = posts.map((p) => recencyScore(p));
  const promotedArr   = posts.map((p) => (p.is_promoted ? 1 : 0));

  // 2. Normalise each array
  const normContent    = minMaxNormalize(contentArr);
  const normEngagement = minMaxNormalize(engagementArr);
  const normRecency    = minMaxNormalize(recencyArr);
  const normPromoted   = minMaxNormalize(promotedArr);

  // 3. Normalise CF scores
  const normCf = minMaxNormalize(cfScores);

  // 4. Compute final blended score per post
  const scored = posts.map((post, i) => {
    const breakdown = {
      content:    BLEND_WEIGHTS.content    * normContent[i],
      cf:         BLEND_WEIGHTS.cf         * normCf[i],
      engagement: BLEND_WEIGHTS.engagement * normEngagement[i],
      recency:    BLEND_WEIGHTS.recency    * normRecency[i],
      promoted:   BLEND_WEIGHTS.promoted   * normPromoted[i],
    };

    const finalScore =
      breakdown.content +
      breakdown.cf +
      breakdown.engagement +
      breakdown.recency +
      breakdown.promoted;

    return { post, finalScore, scoreBreakdown: breakdown };
  });

  // 5. Sort descending by finalScore
  scored.sort((a, b) => b.finalScore - a.finalScore);

  return scored;
}

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  BLEND_WEIGHTS,
  ENGAGEMENT_WEIGHTS,
  ACTION_VALUE,
  engagementScore,
  recencyScore,
  contentMatchScore,
  minMaxNormalize,
  blendAndRank,
};
