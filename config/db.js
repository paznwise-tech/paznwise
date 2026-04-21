'use strict';

const { PrismaClient } = require('@prisma/client');

// ─────────────────────────────────────────────
// PRISMA SINGLETON
// Prevents multiple instances in dev (hot reload)
// ─────────────────────────────────────────────

const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
