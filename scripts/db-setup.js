// scripts/db-setup.js
// Run schema.sql then seed.sql against DATABASE_URL.
// Safe to re-run: schema uses IF NOT EXISTS, seed uses ON CONFLICT DO NOTHING.

require('dotenv').config();
const { Pool } = require('pg');
const fs       = require('fs');
const path     = require('path');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set. Add it to your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

async function run() {
  const schema = fs.readFileSync(path.join(__dirname, '../backend/db/schema.sql'), 'utf8');
  const seed   = fs.readFileSync(path.join(__dirname, '../backend/db/seed.sql'),   'utf8');

  console.log('⟳  Running schema.sql …');
  await pool.query(schema);
  console.log('✔  schema.sql applied.');

  console.log('⟳  Running seed.sql …');
  await pool.query(seed);
  console.log('✔  seed.sql applied.');

  console.log('\n✅ Database setup complete!');
  console.log('   Login: admin@tourbooking.com / admin123');
  console.log('   Login: traveller@tourbooking.com / user123');
  await pool.end();
}

run().catch(err => {
  console.error('db:setup failed:', err.message);
  pool.end();
  process.exit(1);
});

