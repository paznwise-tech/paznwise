'use strict';

const { Pool } = require('pg');

// ─────────────────────────────────────────────
// RAW PG POOL
// Used by feed & interact modules for raw SQL.
// Prisma continues to handle auth-related queries.
// ─────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PG Pool] Unexpected error on idle client:', err);
});

module.exports = pool;
