const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Destination = require('../models/Destination');
const TourPackage = require('../models/TourPackage');
const Hotel = require('../models/Hotel');
const Transport = require('../models/Transport');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/admin/stats - dashboard statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [users, bookings, payments, destinations] = await Promise.all([
      User.countDocuments({ role: 'traveller' }),
      Booking.countDocuments(),
      Payment.find(),
      Destination.countDocuments()
    ]);
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ users, bookings, totalRevenue, destinations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users - list all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/bookings - list all bookings
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('package', 'packageName')
      .populate('hotel', 'hotelName')
      .populate('transport', 'type operatorName')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/bookings/:id - update booking status
router.patch('/bookings/:id', verifyAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/hotels - list all hotels
router.get('/hotels', verifyAdmin, async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/hotels - add a hotel
router.post('/hotels', verifyAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/transport - list all transport options
router.get('/transport', verifyAdmin, async (req, res) => {
  try {
    const transport = await Transport.find();
    res.json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/transport - add transport
router.post('/transport', verifyAdmin, async (req, res) => {
  try {
    const transport = await Transport.create(req.body);
    res.status(201).json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;