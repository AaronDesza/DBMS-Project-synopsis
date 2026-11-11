// scripts/db-setup.js
// Safe to re-run: schema uses IF NOT EXISTS, migration adds unique constraints, seed uses ON CONFLICT DO NOTHING.
// Never overwrites existing user passwords, bookings, or creates duplicate seed rows.

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
  const schemaPath    = path.join(__dirname, '../backend/db/schema.sql');
  const migrationPath = path.join(__dirname, '../backend/db/migration_unique_constraints.sql');
  const seedPath      = path.join(__dirname, '../backend/db/seed.sql');

  console.log('⟳  Applying schema.sql …');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('✔  schema.sql applied.');

  if (fs.existsSync(migrationPath)) {
    console.log('⟳  Applying migration_unique_constraints.sql …');
    try {
      const migration = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(migration);
      console.log('✔  migration_unique_constraints.sql applied.');
    } catch (migErr) {
      console.warn('⚠  Migration notice (run backend/db/dedupe.sql first if duplicates exist):', migErr.message);
    }
  }

  console.log('⟳  Applying seed.sql (ON CONFLICT DO NOTHING) …');
  const seed = fs.readFileSync(seedPath, 'utf8');
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
