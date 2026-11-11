// backend/db/pool.js
// Singleton pg Pool – cached on globalThis for Vercel serverless cold-start reuse.
// Uses DATABASE_URL with SSL (rejectUnauthorized: false) for Neon.
// channel_binding is intentionally NOT set.

const { Pool } = require('pg');

const createPool = () =>
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,              // keep connection count low on serverless
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

// Cache on globalThis so the pool survives hot reloads in dev and
// is reused across serverless invocations in the same container.
if (!globalThis.__pgPool) {
  globalThis.__pgPool = createPool();
}

module.exports = globalThis.__pgPool;

