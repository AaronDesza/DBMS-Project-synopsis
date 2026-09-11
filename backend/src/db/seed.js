/**
 * seed.js — Historical Places Seed Script
 * Seeds the historical_places table with 10 iconic world monuments.
 * Sourced from: https://github.com/aaronxavierdesouza/Historical-Places-Of-The-World
 *
 * Usage:
 *   node src/db/seed.js
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DB_PATH    = path.resolve(__dirname, '../../database.sqlite');

const historicalPlaces = [
  {
    name: 'Colosseum',
    country: 'Italy',
    city: 'Rome',
    description: 'A grand amphitheater that hosted ancient gladiator battles and remains a symbol of Roman engineering. Built between 70–80 AD, it could hold up to 80,000 spectators.',
    category: 'Monument',
    era: '1st century AD',
    century: 1,
    latitude: 41.8902,
    longitude: 12.4922,
    image_url: 'https://a.cdn-hotels.com/gdcs/production110/d737/79d01da7-3020-4b44-9f2d-045801e4ba55.jpg',
    continent: 'Europe',
    significance: 'One of the greatest examples of Roman architecture and engineering.',
    year_built: '70–80 AD',
    entry_fee: 16,
    visiting_hours: '09:00 AM - 07:00 PM'
  },
  {
    name: 'Great Wall of China',
    country: 'China',
    city: 'Beijing',
    description: 'A breathtaking fortification stretching over 13,000 miles across northern China, built to protect ancient Chinese states from invaders.',
    category: 'Fortress',
    era: '7th century BC – 16th century AD',
    century: -7,
    latitude: 40.4319,
    longitude: 116.5704,
    image_url: 'https://www.wanderlustmagazine.com/wp-content/uploads/2023/11/great-wall-of-china.jpg',
    continent: 'Asia',
    significance: 'Largest military structure ever built; UNESCO World Heritage Site.',
    year_built: '7th century BC',
    entry_fee: 10,
    visiting_hours: '07:30 AM - 06:00 PM'
  },
  {
    name: 'Pyramids of Giza',
    country: 'Egypt',
    city: 'Cairo',
    description: 'One of the Seven Wonders of the Ancient World — a marvel of human craftsmanship and mystery, built as royal tombs for pharaohs.',
    category: 'Monument',
    era: '26th century BC',
    century: -26,
    latitude: 29.9792,
    longitude: 31.1342,
    image_url: 'https://media.architecturaldigest.com/photos/59fc9a17f0511d186d92102f/master/pass/Great%20Pyramid%20of%20Giza%201.jpg',
    continent: 'Africa',
    significance: 'Only surviving wonder of the Seven Wonders of the Ancient World.',
    year_built: 'c. 2560 BC',
    entry_fee: 10,
    visiting_hours: '08:00 AM - 05:00 PM'
  },
  {
    name: 'Eiffel Tower',
    country: 'France',
    city: 'Paris',
    description: 'An iconic iron lattice tower located in Paris — one of the most recognized landmarks in the world, symbolizing art, architecture, and romance.',
    category: 'Monument',
    era: '19th century',
    century: 19,
    latitude: 48.8584,
    longitude: 2.2945,
    image_url: 'https://media.sciencephoto.com/image/f0388482/800wm/F0388482-Aerial_view_of_the_Eiffel_Tower,_Paris,_France.jpg',
    continent: 'Europe',
    significance: 'A global cultural icon of France and one of the most visited monuments.',
    year_built: '1887–1889',
    entry_fee: 28,
    visiting_hours: '09:30 AM - 11:45 PM'
  },
  {
    name: 'Christ the Redeemer',
    country: 'Brazil',
    city: 'Rio de Janeiro',
    description: 'An iconic Art Deco statue of Jesus atop Mount Corcovado in Rio de Janeiro, symbolizing faith and hope embraced by millions.',
    category: 'Monument',
    era: '20th century',
    century: 20,
    latitude: -22.9519,
    longitude: -43.2105,
    image_url: 'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/christ-the-redeemer-delphimages-photo-creations.jpg',
    continent: 'South America',
    significance: 'One of the New Seven Wonders of the World; UNESCO World Heritage Site.',
    year_built: '1922–1931',
    entry_fee: 25,
    visiting_hours: '08:00 AM - 07:00 PM'
  },
  {
    name: 'Statue of Liberty',
    country: 'United States',
    city: 'New York',
    description: 'Gifted by France to the United States, this colossal statue in New York Harbor symbolizes freedom and democracy.',
    category: 'Monument',
    era: '19th century',
    century: 19,
    latitude: 40.6892,
    longitude: -74.0445,
    image_url: 'https://thumbs.dreamstime.com/b/statue-liberty-stand-19791613.jpg',
    continent: 'North America',
    significance: 'A universal symbol of freedom and democracy; UNESCO World Heritage Site.',
    year_built: '1875–1886',
    entry_fee: 24,
    visiting_hours: '09:30 AM - 05:00 PM'
  },
  {
    name: 'Angkor Wat',
    country: 'Cambodia',
    city: 'Siem Reap',
    description: 'The world\'s largest religious monument, known for its majestic Khmer architecture and stunning sunrise views over its towers.',
    category: 'Temple',
    era: '12th century',
    century: 12,
    latitude: 13.4125,
    longitude: 103.8670,
    image_url: 'https://smarthistory.org/wp-content/uploads/2023/11/799603181_d199a81331_o.jpg',
    continent: 'Asia',
    significance: 'Largest religious monument in the world; UNESCO World Heritage Site.',
    year_built: 'c. 1113–1150',
    entry_fee: 37,
    visiting_hours: '05:00 AM - 06:00 PM'
  },
  {
    name: 'Taj Mahal',
    country: 'India',
    city: 'Agra',
    description: 'A magnificent white marble mausoleum built by Mughal Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal — an eternal symbol of love.',
    category: 'Monument',
    era: '17th century',
    century: 17,
    latitude: 27.1751,
    longitude: 78.0421,
    image_url: 'https://tse1.mm.bing.net/th/id/OIP.ymWt0I3oeUE6weW-kYO7LQHaFk?rs=1&pid=ImgDetMain&o=7&rm=3',
    continent: 'Asia',
    significance: 'UNESCO World Heritage Site; one of the New Seven Wonders of the World.',
    year_built: '1632–1653',
    entry_fee: 13,
    visiting_hours: '06:00 AM - 06:30 PM'
  },
  {
    name: 'Chichén Itzá',
    country: 'Mexico',
    city: 'Yucatán',
    description: 'A powerful Mayan city famed for its Pyramid of Kukulkan — a masterpiece of astronomy and architecture in the Yucatán Peninsula.',
    category: 'Ruins',
    era: '7th–13th century',
    century: 7,
    latitude: 20.6843,
    longitude: -88.5678,
    image_url: 'https://img.freepik.com/premium-photo/chichen-itza-mayan-legacy-stone_984027-264581.jpg',
    continent: 'North America',
    significance: 'One of the New Seven Wonders of the World; UNESCO World Heritage Site.',
    year_built: 'c. 600–1200 AD',
    entry_fee: 25,
    visiting_hours: '08:00 AM - 05:00 PM'
  },
  {
    name: 'Machu Picchu',
    country: 'Peru',
    city: 'Cusco Region',
    description: 'An ancient Incan citadel nestled high in the Andes Mountains, offering breathtaking views and historical mystery in the Peruvian Andes.',
    category: 'Ruins',
    era: '15th century',
    century: 15,
    latitude: -13.1631,
    longitude: -72.5450,
    image_url: 'https://curiosmos.com/wp-content/uploads/2019/11/A-view-of-the-ancient-Inca-city-of-Macchu-Picchu-768x511.jpg',
    continent: 'South America',
    significance: 'UNESCO World Heritage Site; one of the New Seven Wonders of the World.',
    year_built: 'c. 1450 AD',
    entry_fee: 52,
    visiting_hours: '06:00 AM - 05:00 PM'
  }
];

async function seedHistoricalPlaces() {
  let db;
  try {
    console.log('🌍 Connecting to database...');
    db = await open({ filename: DB_PATH, driver: sqlite3.Database });
    await db.run('PRAGMA foreign_keys = ON;');

    // Ensure historical_places table exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS historical_places (
        place_id       INTEGER PRIMARY KEY AUTOINCREMENT,
        name           VARCHAR(150) NOT NULL,
        country        VARCHAR(100) NOT NULL,
        city           VARCHAR(100),
        description    TEXT,
        category       VARCHAR(80)  NOT NULL DEFAULT 'Monument',
        era            VARCHAR(100),
        century        INTEGER,
        latitude       REAL,
        longitude      REAL,
        image_url      TEXT,
        continent      VARCHAR(50)  DEFAULT 'Global',
        significance   TEXT,
        year_built     VARCHAR(50),
        entry_fee      DECIMAL(8,2) DEFAULT 0,
        visiting_hours VARCHAR(100) DEFAULT '09:00 AM - 05:00 PM',
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const existing = await db.get('SELECT COUNT(*) as count FROM historical_places');
    if (existing.count > 0) {
      console.log(`ℹ️  historical_places already has ${existing.count} record(s). Skipping seed.`);
      console.log('   To re-seed, run: DELETE FROM historical_places; then re-run this script.');
      await db.close();
      return;
    }

    console.log(`🌱 Seeding ${historicalPlaces.length} historical places...`);

    for (const place of historicalPlaces) {
      await db.run(
        `INSERT INTO historical_places
         (name, country, city, description, category, era, century, latitude, longitude,
          image_url, continent, significance, year_built, entry_fee, visiting_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          place.name, place.country, place.city, place.description,
          place.category, place.era, place.century,
          place.latitude, place.longitude, place.image_url,
          place.continent, place.significance, place.year_built,
          place.entry_fee, place.visiting_hours
        ]
      );
      console.log(`   ✅ Inserted: ${place.name} (${place.country})`);
    }

    // Also ensure favorites table exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL,
        place_id    INTEGER NOT NULL,
        saved_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, place_id),
        FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
        FOREIGN KEY (place_id) REFERENCES historical_places(place_id) ON DELETE CASCADE
      )
    `);

    console.log('\n✨ Seed complete! 10 historical places have been added to the database.');
    console.log('   API available at: GET http://localhost:5000/api/places\n');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    if (db) await db.close();
  }
}

seedHistoricalPlaces();
