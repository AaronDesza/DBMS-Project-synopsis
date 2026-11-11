const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/admin/stats – dashboard statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [usersRes, bookingsRes, revenueRes, destRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'traveller'"),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query('SELECT COALESCE(SUM(amount),0) AS total_revenue FROM payments'),
      pool.query('SELECT COUNT(*) FROM destinations')
    ]);
    res.json({
      users:        parseInt(usersRes.rows[0].count,  10),
      bookings:     parseInt(bookingsRes.rows[0].count, 10),
      totalRevenue: parseFloat(revenueRes.rows[0].total_revenue),
      destinations: parseInt(destRes.rows[0].count,  10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users – list all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/bookings – list all bookings
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*,
              u.name AS user_name, u.email AS user_email,
              p.package_name,
              h.hotel_name,
              t.type AS transport_type, t.operator_name
         FROM bookings b
         JOIN users        u ON u.id = b.user_id
         JOIN tour_packages p ON p.id = b.package_id
         JOIN hotels        h ON h.id = b.hotel_id
         JOIN transport     t ON t.id = b.transport_id
        ORDER BY b.booking_date DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/bookings/:id – update booking status
router.patch('/bookings/:id', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [req.body.status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/hotels – list all hotels
router.get('/hotels', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM hotels ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/hotels – add a hotel
router.post('/hotels', verifyAdmin, async (req, res) => {
  try {
    const { hotel_name, price_per_night, rating } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO hotels (hotel_name, price_per_night, rating) VALUES ($1,$2,$3) RETURNING *',
      [hotel_name, price_per_night, rating]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/transport – list all transport options
router.get('/transport', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transport ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/transport – add transport
router.post('/transport', verifyAdmin, async (req, res) => {
  try {
    const { type, operator_name, price } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO transport (type, operator_name, price) VALUES ($1,$2,$3) RETURNING *',
      [type, operator_name, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
