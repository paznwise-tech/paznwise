'use strict';

// ─────────────────────────────────────────────
// IN-MEMORY CACHE (Redis-compatible interface)
// Drop-in replacement — swap for ioredis later.
// ─────────────────────────────────────────────

const store = new Map();

/**
 * Get a cached value by key.
 * Returns null if key doesn't exist or has expired.
 *
 * @param {string} key
 * @returns {string|null}
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set a cached value with optional TTL.
 *
 * @param {string} key
 * @param {string} value
 * @param {number} [ttlSeconds] - Time to live in seconds
 */
function set(key, value, ttlSeconds) {
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  store.set(key, { value, expiresAt });
}

/**
 * Delete a cached key.
 *
 * @param {string} key
 */
function del(key) {
  store.delete(key);
}

module.exports = { get, set, del };
