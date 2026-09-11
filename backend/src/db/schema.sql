-- ==========================================================
-- Travel & Tour Exploration System - DBMS Relational Schema
-- Supports SQLite, MySQL, and PostgreSQL compatibility
-- ==========================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table (Travelers & System Admins)
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'traveler' CHECK(role IN ('traveler', 'admin', 'guide')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
    destination_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    climate VARCHAR(50),
    description TEXT,
    image_url TEXT,
    best_time_to_visit VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tours / Packages Table
CREATE TABLE IF NOT EXISTS tours (
    tour_id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination_id INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK(category IN ('Adventure', 'Cultural', 'Relaxation', 'Wildlife', 'Culinary', 'Eco-Tourism')),
    duration_days INTEGER NOT NULL CHECK(duration_days > 0),
    price_per_person DECIMAL(10, 2) NOT NULL CHECK(price_per_person >= 0),
    max_group_size INTEGER NOT NULL DEFAULT 15,
    difficulty VARCHAR(20) DEFAULT 'Moderate' CHECK(difficulty IN ('Easy', 'Moderate', 'Challenging', 'Expert')),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_reviews INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    overview TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Tour Daily Itinerary Table
CREATE TABLE IF NOT EXISTS itinerary_items (
    itinerary_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    activities TEXT NOT NULL,
    meals_included VARCHAR(100) DEFAULT 'Breakfast',
    accommodation VARCHAR(150),
    FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE
);

-- 5. Guides Table
CREATE TABLE IF NOT EXISTS guides (
    guide_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20),
    languages VARCHAR(150) NOT NULL,
    experience_years INTEGER DEFAULT 2,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    bio TEXT,
    photo_url TEXT
);

-- 6. Tour Guides Junction (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS tour_guides (
    tour_id INTEGER NOT NULL,
    guide_id INTEGER NOT NULL,
    is_lead BOOLEAN DEFAULT 0,
    PRIMARY KEY (tour_id, guide_id),
    FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES guides(guide_id) ON DELETE CASCADE
);

-- 7. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    tour_id INTEGER NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE NOT NULL,
    travelers_count INTEGER NOT NULL CHECK(travelers_count > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    special_requests TEXT,
    booking_status VARCHAR(20) DEFAULT 'Confirmed' CHECK(booking_status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    payment_status VARCHAR(20) DEFAULT 'Paid' CHECK(payment_status IN ('Pending', 'Paid', 'Refunded', 'Failed')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE RESTRICT
);

-- 8. Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    title VARCHAR(150),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    transaction_reference VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Credit Card' CHECK(payment_method IN ('Credit Card', 'Debit Card', 'UPI / NetBanking', 'PayPal', 'Crypto')),
    status VARCHAR(20) DEFAULT 'Success' CHECK(status IN ('Success', 'Pending', 'Failed')),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- ==========================================================
-- 10. Historical Places Table (for the Historical Places module)
-- ==========================================================
CREATE TABLE IF NOT EXISTS historical_places (
    place_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name         VARCHAR(150) NOT NULL,
    country      VARCHAR(100) NOT NULL,
    city         VARCHAR(100),
    description  TEXT,
    category     VARCHAR(80)  NOT NULL DEFAULT 'Monument'
                 CHECK(category IN ('Monument','Temple','Palace','Fortress','Ruins','UNESCO Site','Wonder','Natural','Other')),
    era          VARCHAR(100),              -- e.g. "1st century AD", "17th Century", "Ancient"
    century      INTEGER,                  -- numeric century, e.g. 1, 17, -3 (BC as negative)
    latitude     REAL,
    longitude    REAL,
    image_url    TEXT,
    continent    VARCHAR(50)  DEFAULT 'Global',
    significance TEXT,
    year_built   VARCHAR(50),
    entry_fee    DECIMAL(8,2) DEFAULT 0,
    visiting_hours VARCHAR(100) DEFAULT '09:00 AM - 05:00 PM',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Favorites Table (Users saving Historical Places)
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    place_id    INTEGER NOT NULL,
    saved_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, place_id),
    FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES historical_places(place_id) ON DELETE CASCADE
);

-- ==========================================================
-- DBMS Indexes for Performance Optimization
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_price ON tours(price_per_person);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_places_country   ON historical_places(country);
CREATE INDEX IF NOT EXISTS idx_places_category  ON historical_places(category);
CREATE INDEX IF NOT EXISTS idx_places_continent ON historical_places(continent);
CREATE INDEX IF NOT EXISTS idx_favorites_user   ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_place  ON favorites(place_id);

-- ==========================================================
-- Relational Views (For Academic Demonstration & Reporting)
-- ==========================================================

-- View 1: Tour Overview with Destination and Guide Count
CREATE VIEW IF NOT EXISTS view_tour_summary AS
SELECT 
    t.tour_id,
    t.title AS tour_title,
    t.category,
    t.duration_days,
    t.price_per_person,
    t.difficulty,
    t.rating,
    t.total_reviews,
    d.name AS destination_name,
    d.country,
    COUNT(DISTINCT tg.guide_id) AS assigned_guides_count,
    COUNT(DISTINCT b.booking_id) AS total_bookings_count,
    COALESCE(SUM(b.total_amount), 0) AS total_revenue_generated
FROM tours t
JOIN destinations d ON t.destination_id = d.destination_id
LEFT JOIN tour_guides tg ON t.tour_id = tg.tour_id
LEFT JOIN bookings b ON t.tour_id = b.tour_id AND b.booking_status != 'Cancelled'
GROUP BY t.tour_id;

-- View 2: Booking Details with Customer and Tour Information
CREATE VIEW IF NOT EXISTS view_booking_details AS
SELECT 
    b.booking_id,
    b.booking_reference,
    b.booking_date,
    b.travel_date,
    b.travelers_count,
    b.total_amount,
    b.booking_status,
    b.payment_status,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    t.title AS tour_title,
    t.category AS tour_category,
    d.name AS destination_name,
    d.country AS destination_country
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN tours t ON b.tour_id = t.tour_id
JOIN destinations d ON t.destination_id = d.destination_id;
