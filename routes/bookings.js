const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const Hotel = require('../models/Hotel');
const Transport = require('../models/Transport');
const { verifyToken } = require('../middleware/auth');

// POST /api/bookings - create booking (auth required)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { packageId, hotelId, transportId, travelDate } = req.body;

    const [pkg, hotel, transport] = await Promise.all([
      TourPackage.findById(packageId),
      Hotel.findById(hotelId),
      Transport.findById(transportId)
    ]);

    if (!pkg || !hotel || !transport) return res.status(404).json({ error: 'Invalid booking references.' });

    const hotelTotal = hotel.pricePerNight * pkg.durationDays;
    const totalAmount = pkg.price + hotelTotal + transport.price;

    const booking = await Booking.create({
      user: req.user.id,
      package: packageId,
      hotel: hotelId,
      transport: transportId,
      travelDate,
      priceBreakdown: {
        packagePrice: pkg.price,
        hotelTotal,
        transportPrice: transport.price
      },
      totalAmount,
      status: 'pending'
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/my - get user's bookings
router.get('/my', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('package', 'packageName durationDays price')
      .populate('hotel', 'hotelName pricePerNight rating')
      .populate('transport', 'type operatorName price')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id - get single booking
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('package')
      .populate('hotel')
      .populate('transport')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/cancel - cancel booking
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled.', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;