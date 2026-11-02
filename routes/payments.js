const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/auth');

// POST /api/payments - create payment for booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookingId, paymentMode } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' });

    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment) return res.status(400).json({ error: 'Payment already made for this booking.' });

    const receiptNo = 'TRB-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const payment = await Payment.create({
      booking: bookingId,
      amount: booking.totalAmount,
      paymentMode,
      receiptNo
    });

    booking.status = 'confirmed';
    await booking.save();

    res.status(201).json({ payment, message: 'Payment successful! Booking confirmed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/my - get user's payment receipts
router.get('/my', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).select('_id');
    const bookingIds = bookings.map(b => b._id);
    const payments = await Payment.find({ booking: { $in: bookingIds } })
      .populate({ path: 'booking', populate: [{ path: 'package', select: 'packageName' }, { path: 'hotel', select: 'hotelName' }] })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:id - get single payment receipt
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'booking', populate: [{ path: 'package' }, { path: 'hotel' }, { path: 'transport' }, { path: 'user', select: 'name email phone' }] });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;