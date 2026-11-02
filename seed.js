const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Destination = require('./models/Destination');
const TourPackage = require('./models/TourPackage');
const Hotel = require('./models/Hotel');
const Transport = require('./models/Transport');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([
      User.deleteMany({}),
      Destination.deleteMany({}),
      TourPackage.deleteMany({}),
      Hotel.deleteMany({}),
      Transport.deleteMany({})
    ]);

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const travellerPassword = await bcrypt.hash('user123', salt);

    const admin = await User.create({
      name: 'Aaron De Souza',
      email: 'admin@tourbooking.com',
      password: adminPassword,
      phone: '9876543210',
      role: 'admin'
    });

    await User.create({
      name: 'Test Traveller',
      email: 'traveller@tourbooking.com',
      password: travellerPassword,
      phone: '9123456780',
      role: 'traveller'
    });

    const destinations = await Destination.insertMany([
      {
        name: 'Taj Mahal',
        location: 'Agra, India',
        category: 'Heritage',
        description: 'An immense mausoleum of white marble built in Agra between 1631 and 1648 by order of the Mughal emperor Shah Jahan.',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
        createdBy: admin._id
      },
      {
        name: 'Hampi Monuments',
        location: 'Karnataka, India',
        category: 'Ancient Ruins',
        description: 'UNESCO World Heritage site featuring Vijayanagara Empire temples, stone chariots, and royal pavilions.',
        imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f423b971?auto=format&fit=crop&w=800&q=80',
        createdBy: admin._id
      },
      {
        name: 'The Colosseum',
        location: 'Rome, Italy',
        category: 'Monument',
        description: 'The largest ancient amphitheatre ever built, standing in the heart of Rome as an iconic symbol of Imperial Rome.',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
        createdBy: admin._id
      },
      {
        name: 'Machu Picchu',
        location: 'Cusco Region, Peru',
        category: 'Wonder',
        description: 'A 15th-century Inca citadel set high in the Andes Mountains in Peru, renowned for its dry-stone walls and panoramic views.',
        imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
        createdBy: admin._id
      }
    ]);

    await TourPackage.insertMany([
      {
        packageName: 'Golden Triangle Royal Heritage Tour',
        durationDays: 3,
        price: 10000,
        details: 'Guided tour of Taj Mahal, Agra Fort, and Fatehpur Sikri with local historian and sunrise entry.',
        destinations: [destinations[0]._id]
      },
      {
        packageName: 'Vijayanagara Empire Expedition',
        durationDays: 4,
        price: 12500,
        details: 'Complete exploration of Virupaksha Temple, Vittala Temple Stone Chariot, and Coracle ride.',
        destinations: [destinations[1]._id]
      }
    ]);

    await Hotel.insertMany([
      { hotelName: 'Heritage Palace Inn (Standard)', pricePerNight: 2000, rating: 4 },
      { hotelName: 'Grand Royal Residency (Deluxe)', pricePerNight: 3500, rating: 5 }
    ]);

    await Transport.insertMany([
      { type: 'Flight', operatorName: 'IndiGo / Air India Express', price: 5500 },
      { type: 'Train', operatorName: 'Vande Bharat / Rajdhani Express', price: 3000 }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();