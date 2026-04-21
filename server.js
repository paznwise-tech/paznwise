'use strict';

// ─────────────────────────────────────────────
// ENV
// ─────────────────────────────────────────────
require('dotenv').config();

// ─────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────
const express    = require('express');
const cors       = require('cors');
const authRoutes = require('./routes/auth.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Paznwise API is live.',
    version: '1.0.0',
  });
});

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.use('/api/', authRoutes);   // POST /api/signup  |  POST /api/login

// ─────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : 'An unexpected error occurred.';

  if (!err.isOperational) {
    console.error('[Unhandled Error]', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
