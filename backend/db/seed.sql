-- =============================================================
-- TourQuest – PostgreSQL Seed Data
-- Safe to re-run: uses INSERT … ON CONFLICT
-- Bcrypt hashes (cost 10 generated with bcryptjs):
--   admin123  → $2a$10$YWV7Dd513.nPGYcwUDylDeGqovX4Em1DOmGKq/WqQNCyQPQyRfdwy
--   user123   → $2a$10$U0yp458dQMdLn20PjSZlVOJwAqbZ86eGWJZqY.oj00BYx0dJJgFru
-- =============================================================

-- ── Seed users ────────────────────────────────────────────────
INSERT INTO users (name, email, password, phone, role) VALUES
  ('Admin',
   'admin@tourbooking.com',
   '$2a$10$YWV7Dd513.nPGYcwUDylDeGqovX4Em1DOmGKq/WqQNCyQPQyRfdwy',
   '0000000000',
   'admin'),
  ('Demo Traveller',
   'traveller@tourbooking.com',
   '$2a$10$U0yp458dQMdLn20PjSZlVOJwAqbZ86eGWJZqY.oj00BYx0dJJgFru',
   '9876543210',
   'traveller')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role;

-- ── Destinations (created_by = admin user id=1) ───────────────
INSERT INTO destinations (created_by, name, location, category, description, image_url) VALUES
  (1,
   'Taj Mahal',
   'Agra, India',
   'Historical',
   '17th-century ivory-white marble mausoleum on the banks of the Yamuna river, built by Mughal emperor Shah Jahan.',
   'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'),
  (1,
   'Hampi Monuments',
   'Karnataka, India',
   'Historical',
   'UNESCO World Heritage site featuring the magnificent ruins of the Vijayanagara Empire temples and palaces.',
   '/images/hampi.png'),
  (1,
   'The Colosseum',
   'Rome, Italy',
   'Historical',
   'Iconic oval amphitheatre in the centre of Rome, the largest ever built, completed in 80 AD.',
   'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'),
  (1,
   'Machu Picchu',
   'Cusco Region, Peru',
   'Heritage',
   '15th-century Inca citadel set high in the Andes Mountains, a wonder of pre-Columbian engineering.',
   'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80')
ON CONFLICT DO NOTHING;

-- ── Tour packages ─────────────────────────────────────────────
INSERT INTO tour_packages (created_by, package_name, duration_days, price, destination_id) VALUES
  (1, 'Golden Triangle & Taj Royal Explorer',   4,  18500.00, 1),
  (1, 'Vijayanagara Heritage Trail (Hampi)',     3,  12000.00, 2),
  (1, 'Roman Empire Heritage Expedition',        6,  85000.00, 3),
  (1, 'Inca Trail & Sacred Valley Tour',         7, 110000.00, 4)
ON CONFLICT DO NOTHING;

-- ── Hotels ───────────────────────────────────────────────────
INSERT INTO hotels (hotel_name, price_per_night, rating) VALUES
  ('The Oberoi Amarvilas Heritage',  6500.00, 4.9),
  ('Evolve Back Kamalapura Palace',  4800.00, 4.6),
  ('Hotel Artemide Roma',            9200.00, 4.7),
  ('Sanctuary Lodge Cusco',         11000.00, 4.8)
ON CONFLICT DO NOTHING;

-- ── Transport ────────────────────────────────────────────────
INSERT INTO transport (type, operator_name, price) VALUES
  ('Flight', 'Air India Express / International', 14500.00),
  ('Train',  'Vande Bharat / Eurail First Class',  3200.00),
  ('Bus',    'Volvo Multi-Axle Sleeper',            1800.00),
  ('Cab',    'Private Chauffeur SUV',               4500.00)
ON CONFLICT DO NOTHING;

