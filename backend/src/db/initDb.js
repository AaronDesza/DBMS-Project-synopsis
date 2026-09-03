import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    console.log('🔄 Initializing Travel DBMS Database...');
    const db = await getDb();

    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const seedsPath = path.resolve(__dirname, 'seeds.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedsSql = fs.readFileSync(seedsPath, 'utf8');

    // Execute schema DDL
    console.log('📐 Applying Relational Schema & Indexes...');
    await db.exec(schemaSql);

    // Check if data already exists
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (usersCount.count === 0) {
      console.log('🌱 Seeding initial sample data...');
      await db.exec(seedsSql);
      console.log('✅ Database seeded successfully with realistic tours, destinations, bookings & reviews!');
    } else {
      console.log('ℹ️ Database already contains records. Schema verified.');
    }

    console.log('🚀 Travel DBMS Database is ready!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDatabase();
}

export default initDatabase;
