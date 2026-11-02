const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/hotels - list all available hotels (public/travellers)
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ rating: -1, pricePerNight: 1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hotels/:id - get single hotel
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found.' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hotels - add a hotel (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
