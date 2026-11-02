const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Destination = require('./models/Destination');
const TourPackage = require('./models/TourPackage');
const Hotel = require('./models/Hotel');
const Transport = require('./models/Transport');
const Review = require('./models/Review');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Destination.deleteMany({}),
      TourPackage.deleteMany({}),
      Hotel.deleteMany({}),
      Transport.deleteMany({}),
      Review.deleteMany({})
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

    const traveller = await User.create({
      name: 'Test Traveller',
      email: 'traveller@tourbooking.com',
      password: travellerPassword,
      phone: '9123456780',
      role: 'traveller'
    });

    console.log('Created Users: Admin & Traveller');

    const destinations = await Destination.insertMany([
      {
        name: 'Taj Mahal',
        location: 'Agra, India',
        category: 'Heritage',
        description: 'An immense mausoleum of pure white marble built in Agra between 1631 and 1648 by Mughal emperor Shah Jahan in memory of Mumtaz Mahal. A crown jewel of Indo-Islamic architecture.',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85',
        createdBy: admin._id
      },
      {
        name: 'Hampi Monuments',
        location: 'Karnataka, India',
        category: 'Ancient Ruins',
        description: 'UNESCO World Heritage site featuring the majestic ruins of the Vijayanagara Empire, monolithic stone chariots, carved musical pillars, and riverside boulder landscapes.',
        imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f423b971?auto=format&fit=crop&w=1200&q=85',
        createdBy: admin._id
      },
      {
        name: 'The Colosseum',
        location: 'Rome, Italy',
        category: 'Monument',
        description: 'The largest ancient amphitheatre ever constructed, standing proudly in the heart of Rome. An awe-inspiring symbol of Imperial Roman engineering, gladiatorial games, and history.',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=85',
        createdBy: admin._id
      },
      {
        name: 'Machu Picchu',
        location: 'Cusco Region, Peru',
        category: 'Wonder',
        description: 'A 15th-century Inca citadel nestled high in the Andean cloud forest, renowned worldwide for its dry-stone masonry, astronomical alignments, and breathtaking mountainous vistas.',
        imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=85',
        createdBy: admin._id
      },
      {
        name: 'Eiffel Tower',
        location: 'Paris, France',
        category: 'Monument',
        description: 'The globally celebrated wrought-iron lattice tower on the Champ de Mars in Paris, designed by Gustave Eiffel. An iconic centerpiece of culture, romance, and French craftsmanship.',
        imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=85',
        createdBy: admin._id
      },
      {
        name: 'Pyramids of Giza',
        location: 'Cairo, Egypt',
        category: 'Wonder',
        description: 'The only surviving wonder of the ancient world. The Great Pyramid of Khufu and its surrounding necropolis have stood guard over the Sahara for over 4,500 years.',
        imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=85',
        createdBy: admin._id
      },
      {
        name: 'Santorini Island',
        location: 'Cyclades, Greece',
        category: 'Heritage',
        description: 'A volcanic island wonder in the Aegean Sea celebrated for its dramatic caldera panoramas, whitewashed cliffside villages, blue-domed chapels, and world-renowned sunsets.',
        imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85',
        createdBy: admin._id
      },
      {
        name: 'Fushimi Inari Taisha',
        location: 'Kyoto, Japan',
        category: 'Temple',
        description: 'The head shrine of the god Inari, famous for its thousands of vibrant vermilion Torii gates winding through scenic Mount Inari sacred forest pathways.',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
        createdBy: admin._id
      }
    ]);

    console.log(`Created ${destinations.length} Destinations`);

    const packages = await TourPackage.insertMany([
      {
        packageName: 'Golden Triangle Royal Heritage Tour',
        durationDays: 3,
        price: 10000,
        details: 'Guided VIP expedition of Taj Mahal, Agra Fort, and Fatehpur Sikri with licensed historian guide, luxury transfers, and priority sunrise entry.',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85',
        destinations: [destinations[0]._id]
      },
      {
        packageName: 'Vijayanagara Empire Archeological Odyssey',
        durationDays: 4,
        price: 12500,
        details: 'Complete historical exploration of Virupaksha Temple, the famed Vittala Temple Stone Chariot, Elephant Stables, and traditional Tungabhadra Coracle ride.',
        imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f423b971?auto=format&fit=crop&w=1200&q=85',
        destinations: [destinations[1]._id]
      },
      {
        packageName: 'Eternal Rome & Ancient Wonders',
        durationDays: 5,
        price: 24000,
        details: 'Exclusive skip-the-line Colosseum underground chambers tour, Roman Forum walk, Pantheon exploration, and authentic Roman culinary experiences.',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=85',
        destinations: [destinations[2]._id]
      },
      {
        packageName: 'Inca Trail & Sacred Valley Expedition',
        durationDays: 6,
        price: 32000,
        details: 'Unforgettable panoramic train ride to Aguas Calientes, full-day guided hike across Machu Picchu citadel ruins, and Sacred Valley cultural immersive stops.',
        imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=85',
        destinations: [destinations[3]._id]
      }
    ]);

    console.log(`Created ${packages.length} Tour Packages`);

    const hotels = await Hotel.insertMany([
      { hotelName: 'Heritage Palace Inn (Standard)', pricePerNight: 2000, rating: 4 },
      { hotelName: 'Grand Royal Residency (Deluxe)', pricePerNight: 3500, rating: 5 },
      { hotelName: 'Imperial Boutique Suites (Luxury)', pricePerNight: 5000, rating: 5 },
      { hotelName: 'Comfort Travellers Lodge (Budget)', pricePerNight: 1200, rating: 3 }
    ]);

    console.log(`Created ${hotels.length} Hotels`);

    const transports = await Transport.insertMany([
      { type: 'Flight', operatorName: 'IndiGo / Air India Express', price: 5500 },
      { type: 'Express Train', operatorName: 'Vande Bharat / Shatabdi Express', price: 1800 },
      { type: 'AC Tourist Coach', operatorName: 'Royal Cruiser Volvo AC', price: 1100 },
      { type: 'Private Chauffeur SUV', operatorName: 'Toyota Innova Crysta Private', price: 3200 }
    ]);

    console.log(`Created ${transports.length} Transport options`);

    await Review.insertMany([
      {
        destination: destinations[0]._id,
        user: traveller._id,
        rating: 5,
        comment: 'Sunrise at the Taj Mahal was mesmerizing! Perfectly organized trip with great guides.'
      },
      {
        destination: destinations[1]._id,
        user: traveller._id,
        rating: 5,
        comment: 'Hampi is an architectural wonder. The stone chariot and musical pillars were fascinating!'
      },
      {
        destination: destinations[2]._id,
        user: traveller._id,
        rating: 5,
        comment: 'Walking inside the Roman Colosseum felt like stepping directly into 2,000 years of history.'
      }
    ]);

    console.log('Created initial Reviews');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();