-- ==========================================================
-- Travel & Tour Exploration System - Realistic Sample Seed Data
-- ==========================================================

-- 1. Insert Users
INSERT INTO users (user_id, full_name, email, phone, role, avatar_url) VALUES
(1, 'Alex Rivera', 'alex.rivera@example.com', '+1-555-0192', 'traveler', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
(2, 'Sarah Jenkins', 'sarah.j@example.com', '+1-555-0144', 'traveler', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'),
(3, 'Rohan Sharma', 'rohan.sharma@example.com', '+91-98765-43210', 'traveler', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'),
(4, 'Elena Rostova', 'elena.rostova@example.com', '+44-20-7946-0912', 'traveler', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'),
(5, 'Admin Operator', 'admin@wanderlust-tours.com', '+1-555-0000', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80');

-- 2. Insert Destinations
INSERT INTO destinations (destination_id, name, country, region, climate, description, image_url, best_time_to_visit) VALUES
(1, 'Santorini & Cyclades', 'Greece', 'Southern Aegean', 'Mediterranean', 'Iconic whitewashed villages perched on volcanic cliffs overlooking turquoise waters.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80', 'May - October'),
(2, 'Kyoto & Mount Fuji', 'Japan', 'Kansai & Chubu', 'Temperate', 'Ancient Shinto shrines, bamboo groves, zen gardens, and the majestic snow-capped peak of Fuji.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80', 'March - May, Oct - Nov'),
(3, 'Swiss Alps & Interlaken', 'Switzerland', 'Bernese Oberland', 'Alpine', 'Panoramic alpine glaciers, crystal clear lakes, cogwheel trains, and serene mountain chalets.', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80', 'June - September, Dec - Mar'),
(4, 'Bali & Nusa Islands', 'Indonesia', 'Lesser Sunda', 'Tropical', 'Spiritual temples, emerald rice terraces, world-class surf breaks, and tranquil wellness retreats.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80', 'April - October'),
(5, 'Serengeti & Ngorongoro', 'Tanzania', 'East Africa', 'Savanna', 'The theater of the Great Migration with majestic lions, elephants, and infinite golden horizons.', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80', 'June - October'),
(6, 'Machu Picchu & Sacred Valley', 'Peru', 'Andes', 'Subtropical Highland', 'The mystical lost citadel of the Incas hidden high among misty cloud forests.', 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1000&q=80', 'May - September');

-- 3. Insert Tours
INSERT INTO tours (tour_id, destination_id, title, category, duration_days, price_per_person, max_group_size, difficulty, rating, total_reviews, is_featured, overview, image_url) VALUES
(1, 1, 'Aegean Odyssey: Sunset Sailing & Caldera Wonders', 'Relaxation', 7, 1450.00, 12, 'Easy', 4.95, 28, 1, 'Experience the epitome of Greek island life with luxury catamaran sailing, local wine tastings in Oia, and cliffside dinners.', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80'),
(2, 2, 'Sacred Japan: Shrines, Kaiseki & Fuji Expedition', 'Cultural', 9, 2300.00, 10, 'Moderate', 4.90, 42, 1, 'Immerse yourself in traditional tea ceremonies, historic samurai quarters of Kyoto, and sunrise viewing at Fuji 5th Station.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80'),
(3, 3, 'Alpine Thrills: Jungfrau Glacier & Interlaken Trek', 'Adventure', 6, 1850.00, 14, 'Challenging', 4.85, 19, 1, 'Hike iconic alpine trails, experience the Top of Europe cogwheel railway, and go paragliding over Swiss lakes.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80'),
(4, 4, 'Bali Soul: Ubud Zen, Waterfalls & Coastal Haven', 'Eco-Tourism', 8, 980.00, 16, 'Easy', 4.78, 35, 0, 'Discover holistic yoga sessions, lush Tegalalang terraces, secret canyon waterfalls, and sunset beach seafood barbecue.', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1000&q=80'),
(5, 5, 'Great Migration Safari: Untamed Serengeti Wilderness', 'Wildlife', 7, 3400.00, 8, 'Moderate', 4.98, 51, 1, 'Witness the Big Five in their natural habitat with luxury tented camps, expert naturalist guides, and sunrise hot air balloon safaris.', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1000&q=80'),
(6, 6, 'Inca Trail Classic: Sun Gate & Sacred Ruins', 'Adventure', 5, 1250.00, 12, 'Challenging', 4.88, 24, 0, 'Trek along ancient stone pathways, camp beneath Andean constellations, and enter Machu Picchu via the legendary Sun Gate.', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1000&q=80');

-- 4. Insert Itinerary Items
INSERT INTO itinerary_items (tour_id, day_number, title, activities, meals_included, accommodation) VALUES
(1, 1, 'Arrival in Fira', 'Private airport pickup, welcome cocktails, orientation walk through Fira cobblestones.', 'Dinner', 'Caldera Cliff Suites'),
(1, 2, 'Volcano & Hot Springs Cruise', 'Private catamaran cruise around the Nea Kameni volcano with volcanic mud baths.', 'Breakfast, Lunch', 'Caldera Cliff Suites'),
(1, 3, 'Oia Golden Hour & Wine Pairing', 'Explore traditional windmill quarters and savor Assyrtiko wine tasting during sunset.', 'Breakfast, Dinner', 'Caldera Cliff Suites'),
(2, 1, 'Arrival in Kyoto', 'Bullet train transfer to hotel, evening Gion geisha district walking tour.', 'Dinner', 'Kyoto Ryokan Blossom'),
(2, 2, 'Fushimi Inari & Bamboo Grove', 'Hike the thousand vermilion torii gates followed by serene stroll in Arashiyama.', 'Breakfast, Lunch', 'Kyoto Ryokan Blossom'),
(2, 3, 'Mount Fuji 5th Station Trek', 'Panoramic views of Lake Kawaguchiko and Fuji base camp exploration.', 'Breakfast, Dinner', 'Fuji Onsen Resort'),
(3, 1, 'Interlaken Gateway', 'Check-in, scenic lake cruise on Lake Brienz, traditional Swiss fondue dinner.', 'Dinner', 'Grand Hotel Interlaken'),
(3, 2, 'Jungfraujoch: Top of Europe', 'Cogwheel train ride up through the Eiger north face to the 3,454m ice palace.', 'Breakfast, Lunch', 'Grand Hotel Interlaken'),
(5, 1, 'Arusha to Ngorongoro Crater', 'Drive into the caldera floor, encounter dense lion prides and black rhinos.', 'Lunch, Dinner', 'Ngorongoro Safari Lodge'),
(5, 2, 'Central Serengeti Plains', 'Full day game tracking for the Great Wildebeest Migration across the Mara River.', 'Breakfast, Lunch, Dinner', 'Serengeti Luxury Tented Camp');

-- 5. Insert Guides
INSERT INTO guides (guide_id, name, email, phone, languages, experience_years, rating, bio, photo_url) VALUES
(1, 'Dimitris Vlahos', 'dimitris.v@wanderlust.com', '+30-694-123456', 'Greek, English, Italian', 9, 4.95, 'Born in Santorini, Dimitris has guided maritime and cultural excursions across the Cyclades for nearly a decade.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'),
(2, 'Kenji Takahashi', 'kenji.t@wanderlust.com', '+81-90-1234-5678', 'Japanese, English', 12, 4.98, 'Certified Kyoto master historian and mountain trekking guide specializing in traditional culinary heritage.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'),
(3, 'Amara Mwangi', 'amara.m@wanderlust.com', '+255-754-998877', 'Swahili, English, German', 11, 4.99, 'Veteran wildlife conservationist with unmatched tracking instincts in the Serengeti ecosystem.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'),
(4, 'Mateo Quispe', 'mateo.q@wanderlust.com', '+51-984-556677', 'Quechua, Spanish, English', 8, 4.89, 'Native Andean trek leader with deep knowledge of Incan astronomy, archaeology, and flora.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');

-- 6. Insert Tour Guides Junction (Many-to-Many)
INSERT INTO tour_guides (tour_id, guide_id, is_lead) VALUES
(1, 1, 1),
(2, 2, 1),
(5, 3, 1),
(6, 4, 1),
(3, 1, 0);

-- 7. Insert Bookings
INSERT INTO bookings (booking_id, booking_reference, user_id, tour_id, booking_date, travel_date, travelers_count, unit_price, total_amount, special_requests, booking_status, payment_status) VALUES
(1, 'TRV-2026-001', 1, 1, '2026-08-10 14:32:00', '2026-09-15', 2, 1450.00, 2900.00, 'Vegetarian meals during catamaran cruise.', 'Confirmed', 'Paid'),
(2, 'TRV-2026-002', 2, 2, '2026-08-15 09:15:00', '2026-10-01', 1, 2300.00, 2300.00, 'Prefer quiet room in traditional ryokan.', 'Confirmed', 'Paid'),
(3, 'TRV-2026-003', 3, 5, '2026-08-20 18:45:00', '2026-11-10', 2, 3400.00, 6800.00, 'Celebrating 5th wedding anniversary.', 'Confirmed', 'Paid'),
(4, 'TRV-2026-004', 4, 3, '2026-08-28 11:20:00', '2026-09-22', 3, 1850.00, 5550.00, 'Require trekking pole rentals.', 'Confirmed', 'Paid'),
(5, 'TRV-2026-005', 1, 4, '2026-09-01 16:05:00', '2026-12-05', 2, 980.00, 1960.00, 'Airport transfer needed at midnight.', 'Pending', 'Pending');

-- 8. Insert Payments
INSERT INTO payments (payment_id, booking_id, transaction_reference, amount, payment_method, status, paid_at) VALUES
(1, 1, 'TXN-9812401', 2900.00, 'Credit Card', 'Success', '2026-08-10 14:35:00'),
(2, 2, 'TXN-9812402', 2300.00, 'UPI / NetBanking', 'Success', '2026-08-15 09:18:00'),
(3, 3, 'TXN-9812403', 6800.00, 'PayPal', 'Success', '2026-08-20 18:48:00'),
(4, 4, 'TXN-9812404', 5550.00, 'Credit Card', 'Success', '2026-08-28 11:25:00');

-- 9. Insert Reviews
INSERT INTO reviews (review_id, tour_id, user_id, rating, title, comment, created_at) VALUES
(1, 1, 1, 5, 'Unforgettable Caldera Sunset!', 'The catamaran cruise was pure magic. Dimitris was the best guide we could have asked for.', '2026-08-12 10:00:00'),
(2, 2, 2, 5, 'Magical cultural dive in Kyoto', 'The food was exquisite and visiting the bamboo grove early in the morning was meditative.', '2026-08-18 16:30:00'),
(3, 5, 3, 5, 'Once in a lifetime wildlife adventure', 'Saw the Big Five on day one! The luxury tents under the African stars are worth every penny.', '2026-08-25 12:15:00'),
(4, 3, 4, 5, 'Breathtaking Swiss Panoramas', 'Jungfrau was chilly but exhilarating! Crisp air and flawless organization throughout.', '2026-09-01 09:40:00');
