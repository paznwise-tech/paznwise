'use strict';

// ─────────────────────────────────────────────
// DIVERSITY RE-RANKER
// Ensures no single category dominates the feed.
// ─────────────────────────────────────────────

/**
 * Greedy diversity filter.
 * Iterates scoredPosts (already sorted by score descending).
 * Picks posts while keeping per-category count under maxPerCategory.
 * Remaining slots are filled from overflow in score order.
 *
 * @param {{ post, finalScore, scoreBreakdown }[]} scoredPosts
 * @param {number} [maxPerCategory=3]
 * @param {number} [feedSize=20]
 * @returns {{ post, finalScore, scoreBreakdown }[]}
 */
function diversifyFeed(scoredPosts, maxPerCategory = 3, feedSize = 20) {
  const selected = [];
  const overflow = [];
  const categoryCounts = {};

  // Pass 1: pick posts respecting category cap
  for (const item of scoredPosts) {
    const cat = item.post.category;
    const count = categoryCounts[cat] || 0;

    if (count < maxPerCategory && selected.length < feedSize) {
      selected.push(item);
      categoryCounts[cat] = count + 1;
    } else {
      overflow.push(item);
    }
  }

  // Pass 2: fill remaining slots from overflow (already in score order)
  for (const item of overflow) {
    if (selected.length >= feedSize) break;
    selected.push(item);
  }

  return selected.slice(0, feedSize);
}

module.exports = diversifyFeed;
