-- travel_booking_db.sql
-- Run this in phpMyAdmin or MySQL CLI to set up the database

CREATE DATABASE IF NOT EXISTS travel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_booking_db;

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT DEFAULT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    image_url VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tour_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT DEFAULT NULL,
    package_name VARCHAR(200) NOT NULL,
    duration_days INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    destination_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_name VARCHAR(200) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    rating DECIMAL(2,1) NOT NULL
);

CREATE TABLE IF NOT EXISTS transport (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Flight','Train','Bus','Cab') NOT NULL,
    operator_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    hotel_id INT NOT NULL,
    transport_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending','Confirmed','Cancelled') DEFAULT 'Confirmed',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES tour_packages(id),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    FOREIGN KEY (transport_id) REFERENCES transport(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_mode ENUM('UPI','Credit Card','Debit Card','Net Banking') NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
);

-- ===================== SEED DATA =====================

INSERT INTO admins (name, email, password) VALUES
('Admin', 'admin@historicaltours.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

INSERT INTO users (name, email, password, phone) VALUES
('Aaron De Souza', 'aaron@example.com', '$2y$10$TKh8H1.PfuPhX7HiptIEOO9X5SKCnBSmSDDMRijc7WFlJPXkXnFfW', '9876543210'); -- password: 123456

INSERT INTO destinations (admin_id, name, location, category, description, image_url) VALUES
(1, 'Taj Mahal', 'Agra, India', 'Historical', '17th-century ivory-white marble mausoleum on the Yamuna river.', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'),
(1, 'The Colosseum', 'Rome, Italy', 'Historical', 'Oval amphitheatre in the centre of the city of Rome.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'),
(1, 'Machu Picchu', 'Cusco Region, Peru', 'Heritage', '15th-century Inca citadel located in the Andes.', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80'),
(1, 'Hampi Group of Monuments', 'Karnataka, India', 'Historical', 'UNESCO World Heritage site featuring Vijayanagara Empire temples.', 'https://images.unsplash.com/photo-1600100397608-f010f423b971?auto=format&fit=crop&w=800&q=80');

INSERT INTO tour_packages (admin_id, package_name, duration_days, price, destination_id) VALUES
(1, 'Golden Triangle & Taj Royal Explorer', 4, 18500.00, 1),
(1, 'Roman Empire Heritage Expedition', 6, 85000.00, 2),
(1, 'Inca Trail & Sacred Valley Tour', 7, 110000.00, 3),
(1, 'Vijayanagara Heritage Trail (Hampi)', 3, 12000.00, 4);

INSERT INTO hotels (hotel_name, price_per_night, rating) VALUES
('The Oberoi Amarvilas Heritage', 6500.00, 4.9),
('Hotel Artemide Roma', 9200.00, 4.7),
('Sanctuary Lodge Cusco', 11000.00, 4.8),
('Evolve Back Kamalapura Palace', 4800.00, 4.6);

INSERT INTO transport (type, operator_name, price) VALUES
('Flight', 'Air India Express / International', 14500.00),
('Train', 'Vande Bharat / Eurail First Class', 3200.00),
('Bus', 'Volvo Multi-Axle Sleeper', 1800.00),
('Cab', 'Private Chauffeur SUV', 4500.00);

INSERT INTO reviews (user_id, destination_id, rating, comment) VALUES
(1, 1, 5, 'Breathtaking sunrise view at the Taj Mahal!');
