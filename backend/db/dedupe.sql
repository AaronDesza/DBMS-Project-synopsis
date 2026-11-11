-- =============================================================
-- TourQuest – Deduplication Script (Neon PostgreSQL)
-- Removes duplicate rows while preserving the lowest id for each.
-- Re-points all foreign key references before deleting.
-- Safe to run in Neon SQL Editor inside a single transaction.
-- =============================================================

BEGIN;

-- 1. Re-point tour_packages.destination_id to lowest destination id
UPDATE tour_packages tp
SET destination_id = d_kept.id
FROM destinations d_dup
JOIN (
    SELECT name, MIN(id) AS id
    FROM destinations
    GROUP BY name
) d_kept ON d_dup.name = d_kept.name
WHERE tp.destination_id = d_dup.id
  AND d_dup.id != d_kept.id;

-- 2. Re-point reviews.destination_id to lowest destination id
UPDATE reviews r
SET destination_id = d_kept.id
FROM destinations d_dup
JOIN (
    SELECT name, MIN(id) AS id
    FROM destinations
    GROUP BY name
) d_kept ON d_dup.name = d_kept.name
WHERE r.destination_id = d_dup.id
  AND d_dup.id != d_kept.id;

-- 3. Re-point bookings.package_id to lowest package id
UPDATE bookings b
SET package_id = p_kept.id
FROM tour_packages p_dup
JOIN (
    SELECT package_name, MIN(id) AS id
    FROM tour_packages
    GROUP BY package_name
) p_kept ON p_dup.package_name = p_kept.package_name
WHERE b.package_id = p_dup.id
  AND p_dup.id != p_kept.id;

-- 4. Re-point bookings.hotel_id to lowest hotel id
UPDATE bookings b
SET hotel_id = h_kept.id
FROM hotels h_dup
JOIN (
    SELECT hotel_name, MIN(id) AS id
    FROM hotels
    GROUP BY hotel_name
) h_kept ON h_dup.hotel_name = h_kept.hotel_name
WHERE b.hotel_id = h_dup.id
  AND h_dup.id != h_kept.id;

-- 5. Re-point bookings.transport_id to lowest transport id
UPDATE bookings b
SET transport_id = t_kept.id
FROM transport t_dup
JOIN (
    SELECT type, operator_name, MIN(id) AS id
    FROM transport
    GROUP BY type, operator_name
) t_kept ON t_dup.type = t_kept.type AND t_dup.operator_name = t_kept.operator_name
WHERE b.transport_id = t_dup.id
  AND t_dup.id != t_kept.id;

-- 6. Delete duplicate reviews (keep lowest id per user and destination)
DELETE FROM reviews
WHERE id NOT IN (
    SELECT MIN(id)
    FROM reviews
    GROUP BY user_id, destination_id
);

-- 7. Delete duplicate tour_packages (keep lowest id per package_name)
DELETE FROM tour_packages
WHERE id NOT IN (
    SELECT MIN(id)
    FROM tour_packages
    GROUP BY package_name
);

-- 8. Delete duplicate hotels (keep lowest id per hotel_name)
DELETE FROM hotels
WHERE id NOT IN (
    SELECT MIN(id)
    FROM hotels
    GROUP BY hotel_name
);

-- 9. Delete duplicate transport (keep lowest id per type and operator_name)
DELETE FROM transport
WHERE id NOT IN (
    SELECT MIN(id)
    FROM transport
    GROUP BY type, operator_name
);

-- 10. Delete duplicate destinations (keep lowest id per name)
DELETE FROM destinations
WHERE id NOT IN (
    SELECT MIN(id)
    FROM destinations
    GROUP BY name
);

COMMIT;

-- =============================================================
-- Verification Queries (Run after COMMIT to verify counts)
-- =============================================================
SELECT 'destinations' AS table_name, count(*) AS total_rows, count(distinct name) AS distinct_names FROM destinations
UNION ALL
SELECT 'tour_packages', count(*), count(distinct package_name) FROM tour_packages
UNION ALL
SELECT 'hotels', count(*), count(distinct hotel_name) FROM hotels
UNION ALL
SELECT 'transport', count(*), count(distinct operator_name) FROM transport
UNION ALL
SELECT 'bookings', count(*), count(distinct id) FROM bookings
UNION ALL
SELECT 'payments', count(*), count(distinct id) FROM payments
UNION ALL
SELECT 'reviews', count(*), count(distinct id) FROM reviews
UNION ALL
SELECT 'users', count(*), count(distinct email) FROM users;
