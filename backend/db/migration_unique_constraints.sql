-- =============================================================
-- Migration: Add Unique Constraints and Destination link on Hotels
-- Safe to re-run: uses IF NOT EXISTS and DO $$ blocks
-- =============================================================

-- 1. Ensure destination_id exists on hotels
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS destination_id INT REFERENCES destinations(id) ON DELETE SET NULL;

-- 2. Populate destination_id for seed hotels if null
UPDATE hotels SET destination_id = 1 WHERE hotel_name = 'The Oberoi Amarvilas Heritage' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 2 WHERE hotel_name = 'Evolve Back Kamalapura Palace' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 3 WHERE hotel_name = 'Hotel Artemide Roma' AND destination_id IS NULL;
UPDATE hotels SET destination_id = 4 WHERE hotel_name = 'Sanctuary Lodge Cusco' AND destination_id IS NULL;

-- 3. Unique constraint on destinations(name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_destinations_name'
    ) THEN
        ALTER TABLE destinations ADD CONSTRAINT uq_destinations_name UNIQUE (name);
    END IF;
END $$;

-- 4. Unique constraint on tour_packages(package_name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_tour_packages_package_name'
    ) THEN
        ALTER TABLE tour_packages ADD CONSTRAINT uq_tour_packages_package_name UNIQUE (package_name);
    END IF;
END $$;

-- 5. Unique constraint on hotels(hotel_name, destination_id) and hotels(hotel_name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_hotels_name'
    ) THEN
        ALTER TABLE hotels ADD CONSTRAINT uq_hotels_name UNIQUE (hotel_name);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_hotels_name_destination'
    ) THEN
        ALTER TABLE hotels ADD CONSTRAINT uq_hotels_name_destination UNIQUE (hotel_name, destination_id);
    END IF;
END $$;

-- 6. Unique constraint on transport(type, operator_name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_transport_type_operator'
    ) THEN
        ALTER TABLE transport ADD CONSTRAINT uq_transport_type_operator UNIQUE (type, operator_name);
    END IF;
END $$;

-- 7. Unique constraint on users(email)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_users_email'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
    END IF;
END $$;
