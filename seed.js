// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const { User, Admin, Destination, TourPackage, Hotel, Transport, Booking, Payment, Review } = require('./models/Schemas');

const seedDatabase = async () => {
    try {
        await connectDB();
        await Promise.all([
            User.deleteMany({}), Admin.deleteMany({}), Destination.deleteMany({}),
            TourPackage.deleteMany({}), Hotel.deleteMany({}), Transport.deleteMany({}),
            Booking.deleteMany({}), Payment.deleteMany({}), Review.deleteMany({})
        ]);

        const hashedAdminPass = await bcrypt.hash('password', 10);
        const hashedUserPass = await bcrypt.hash('123456', 10);

        const admin = await Admin.create({ name: 'Admin', email: 'admin@historicaltours.com', password: hashedAdminPass });
        const demoUser = await User.create({ name: 'Aaron De Souza', email: 'aaron@example.com', password: hashedUserPass, phone: '9876543210' });

        const destinations = await Destination.insertMany([
            { admin_id: admin._id, name: 'Taj Mahal', location: 'Agra, India', category: 'Historical', description: '17th-century ivory-white marble mausoleum on the Yamuna river.', image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
            { admin_id: admin._id, name: 'The Colosseum', location: 'Rome, Italy', category: 'Historical', description: 'Oval amphitheatre in the centre of the city of Rome.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
            { admin_id: admin._id, name: 'Machu Picchu', location: 'Cusco Region, Peru', category: 'Heritage', description: '15th-century Inca citadel located in the Andes.', image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80' },
            { admin_id: admin._id, name: 'Hampi Group of Monuments', location: 'Karnataka, India', category: 'Historical', description: 'UNESCO World Heritage site featuring Vijayanagara Empire temples.', image_url: 'https://images.unsplash.com/photo-1600100397608-f010f423b971?auto=format&fit=crop&w=800&q=80' }
        ]);

        await TourPackage.insertMany([
            { admin_id: admin._id, package_name: 'Golden Triangle & Taj Royal Explorer', duration_days: 4, price: 18500.00, destinations: [destinations[0]._id] },
            { admin_id: admin._id, package_name: 'Roman Empire Heritage Expedition', duration_days: 6, price: 85000.00, destinations: [destinations[1]._id] },
            { admin_id: admin._id, package_name: 'Inca Trail & Sacred Valley Tour', duration_days: 7, price: 110000.00, destinations: [destinations[2]._id] },
            { admin_id: admin._id, package_name: 'Vijayanagara Heritage Trail (Hampi)', duration_days: 3, price: 12000.00, destinations: [destinations[3]._id] }
        ]);

        await Hotel.insertMany([
            { hotel_name: 'The Oberoi Amarvilas Heritage', price_per_night: 6500.00, rating: 4.9 },
            { hotel_name: 'Hotel Artemide Roma', price_per_night: 9200.00, rating: 4.7 },
            { hotel_name: 'Sanctuary Lodge Cusco', price_per_night: 11000.00, rating: 4.8 },
            { hotel_name: 'Evolve Back Kamalapura Palace', price_per_night: 4800.00, rating: 4.6 }
        ]);

        await Transport.insertMany([
            { type: 'Flight', operator_name: 'Air India Express / International', price: 14500.00 },
            { type: 'Train', operator_name: 'Vande Bharat / Eurail First Class', price: 3200.00 },
            { type: 'Bus', operator_name: 'Volvo Multi-Axle Sleeper', price: 1800.00 },
            { type: 'Cab', operator_name: 'Private Chauffeur SUV', price: 4500.00 }
        ]);

        await Review.create({ user_id: demoUser._id, destination_id: destinations[0]._id, rating: 5, comment: 'Breathtaking sunrise view at the Taj Mahal!' });

        console.log('✅ MongoDB Database Seeded Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
