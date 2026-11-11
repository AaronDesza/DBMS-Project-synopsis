const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyAdmin } = require('../middleware/auth');

const mapHotel = (h) => ({
  _id: String(h.id),
  id: h.id,
  hotelName: h.hotel_name,
  hotel_name: h.hotel_name,
  pricePerNight: parseFloat(h.price_per_night),
  price_per_night: parseFloat(h.price_per_night),
  rating: parseFloat(h.rating)
});

// GET /api/hotels – public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM hotels ORDER BY rating DESC, price_per_night ASC'
    );
    res.json(rows.map(mapHotel));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hotels/:id – public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Hotel not found.' });
    res.json(mapHotel(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hotels – admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const name = req.body.hotelName || req.body.hotel_name;
    const price = req.body.pricePerNight || req.body.price_per_night;
    const rating = req.body.rating;
    const { rows } = await pool.query(
      'INSERT INTO hotels (hotel_name, price_per_night, rating) VALUES ($1,$2,$3) RETURNING *',
      [name, price, rating]
    );
    res.status(201).json(mapHotel(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
