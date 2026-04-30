'use strict';

// ─────────────────────────────────────────────
// COLD-START FEED
// Trending fallback for users with no preferences.
// ─────────────────────────────────────────────

const { engagementScore, recencyScore, minMaxNormalize } = require('./feed.scorer');

/**
 * Ranks posts by: 0.7 * normalised_engagement + 0.3 * normalised_recency
 *
 * @param {object[]} posts - Array of post rows
 * @param {number}   limit - Number of posts to return
 * @returns {{ post, finalScore, scoreBreakdown }[]}
 */
function getColdStartFeed(posts, limit) {
  if (!posts.length) return [];

  const rawEngagement = posts.map((p) => engagementScore(p));
  const rawRecency    = posts.map((p) => recencyScore(p));

  const normEngagement = minMaxNormalize(rawEngagement);
  const normRecency    = minMaxNormalize(rawRecency);

  const scored = posts.map((post, i) => {
    const engVal = normEngagement[i];
    const recVal = normRecency[i];
    const finalScore = 0.7 * engVal + 0.3 * recVal;

    return {
      post,
      finalScore,
      scoreBreakdown: {
        content:    0,
        cf:         0,
        engagement: engVal,
        recency:    recVal,
        promoted:   0,
      },
    };
  });

  scored.sort((a, b) => b.finalScore - a.finalScore);

  return scored.slice(0, limit);
}

module.exports = getColdStartFeed;
