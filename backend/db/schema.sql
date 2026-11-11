-- =============================================================
-- TourQuest – PostgreSQL Schema (Neon-compatible)
-- Safe to re-run: uses IF NOT EXISTS / DO $$ idioms
-- =============================================================

-- Users (travellers + admins unified, role column distinguishes)
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,
    phone         VARCHAR(20)   NOT NULL DEFAULT '',
    role          VARCHAR(20)   NOT NULL DEFAULT 'traveller'
                    CHECK (role IN ('traveller','admin')),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Destinations
CREATE TABLE IF NOT EXISTS destinations (
    id            SERIAL PRIMARY KEY,
    created_by    INT           REFERENCES users(id) ON DELETE SET NULL,
    name          VARCHAR(150)  NOT NULL,
    location      VARCHAR(200)  NOT NULL,
    category      VARCHAR(100)  NOT NULL,
    description   TEXT          NOT NULL DEFAULT '',
    image_url     VARCHAR(500)  NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Tour packages (each linked to one destination)
CREATE TABLE IF NOT EXISTS tour_packages (
    id              SERIAL PRIMARY KEY,
    created_by      INT           REFERENCES users(id) ON DELETE SET NULL,
    package_name    VARCHAR(200)  NOT NULL,
    duration_days   INT           NOT NULL CHECK (duration_days > 0),
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    destination_id  INT           REFERENCES destinations(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Hotels
CREATE TABLE IF NOT EXISTS hotels (
    id              SERIAL PRIMARY KEY,
    hotel_name      VARCHAR(200)  NOT NULL,
    price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
    rating          NUMERIC(2,1)  NOT NULL CHECK (rating BETWEEN 0 AND 5)
);

-- Transport
CREATE TABLE IF NOT EXISTS transport (
    id              SERIAL PRIMARY KEY,
    type            VARCHAR(20)   NOT NULL
                      CHECK (type IN ('Flight','Train','Bus','Cab')),
    operator_name   VARCHAR(200)  NOT NULL,
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id                  SERIAL PRIMARY KEY,
    user_id             INT           NOT NULL REFERENCES users(id),
    package_id          INT           NOT NULL REFERENCES tour_packages(id),
    hotel_id            INT           NOT NULL REFERENCES hotels(id),
    transport_id        INT           NOT NULL REFERENCES transport(id),
    travel_date         DATE          NOT NULL,
    pkg_price           NUMERIC(10,2) NOT NULL DEFAULT 0,
    hotel_total         NUMERIC(10,2) NOT NULL DEFAULT 0,
    transport_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    status              VARCHAR(20)   NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','confirmed','cancelled')),
    booking_date        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Payments (one per booking)
CREATE TABLE IF NOT EXISTS payments (
    id              SERIAL PRIMARY KEY,
    booking_id      INT           NOT NULL UNIQUE REFERENCES bookings(id),
    amount          NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    payment_mode    VARCHAR(30)   NOT NULL
                      CHECK (payment_mode IN ('UPI','Credit Card','Debit Card','Net Banking')),
    receipt_no      VARCHAR(50)   NOT NULL UNIQUE,
    payment_date    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Reviews (one review per user per destination enforced by unique constraint)
CREATE TABLE IF NOT EXISTS reviews (
    id              SERIAL PRIMARY KEY,
    user_id         INT           NOT NULL REFERENCES users(id),
    destination_id  INT           NOT NULL REFERENCES destinations(id),
    rating          SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT          NOT NULL,
    review_date     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, destination_id)
);

