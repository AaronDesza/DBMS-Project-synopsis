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
    res.json(rows.map(u => ({
      _id: String(u.id),
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.created_at,
      created_at: u.created_at
    })));
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
    res.json(rows.map(b => ({
      _id: String(b.id),
      id: b.id,
      user: {
        _id: String(b.user_id),
        name: b.user_name,
        email: b.user_email
      },
      package: {
        _id: String(b.package_id),
        packageName: b.package_name,
        package_name: b.package_name
      },
      hotel: {
        _id: String(b.hotel_id),
        hotelName: b.hotel_name,
        hotel_name: b.hotel_name
      },
      transport: {
        _id: String(b.transport_id),
        type: b.transport_type,
        operatorName: b.operator_name,
        operator_name: b.operator_name
      },
      travelDate: b.travel_date,
      travel_date: b.travel_date,
      totalAmount: parseFloat(b.total_amount),
      total_amount: parseFloat(b.total_amount),
      status: b.status,
      bookingDate: b.booking_date,
      booking_date: b.booking_date
    })));
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
    res.json({
      _id: String(rows[0].id),
      id: rows[0].id,
      status: rows[0].status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/hotels – list all hotels
router.get('/hotels', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM hotels ORDER BY id');
    res.json(rows.map(h => ({
      _id: String(h.id),
      id: h.id,
      hotelName: h.hotel_name,
      hotel_name: h.hotel_name,
      pricePerNight: parseFloat(h.price_per_night),
      price_per_night: parseFloat(h.price_per_night),
      rating: parseFloat(h.rating)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/hotels – add a hotel
router.post('/hotels', verifyAdmin, async (req, res) => {
  try {
    const name = req.body.hotelName || req.body.hotel_name;
    const price = req.body.pricePerNight || req.body.price_per_night;
    const rating = req.body.rating;
    const { rows } = await pool.query(
      'INSERT INTO hotels (hotel_name, price_per_night, rating) VALUES ($1,$2,$3) RETURNING *',
      [name, price, rating]
    );
    res.status(201).json({
      _id: String(rows[0].id),
      id: rows[0].id,
      hotelName: rows[0].hotel_name,
      pricePerNight: parseFloat(rows[0].price_per_night),
      rating: parseFloat(rows[0].rating)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/transport – list all transport options
router.get('/transport', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transport ORDER BY id');
    res.json(rows.map(t => ({
      _id: String(t.id),
      id: t.id,
      type: t.type,
      operatorName: t.operator_name,
      operator_name: t.operator_name,
      price: parseFloat(t.price)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/transport – add transport
router.post('/transport', verifyAdmin, async (req, res) => {
  try {
    const type = req.body.type;
    const opName = req.body.operatorName || req.body.operator_name;
    const price = req.body.price;
    const { rows } = await pool.query(
      'INSERT INTO transport (type, operator_name, price) VALUES ($1,$2,$3) RETURNING *',
      [type, opName, price]
    );
    res.status(201).json({
      _id: String(rows[0].id),
      id: rows[0].id,
      type: rows[0].type,
      operatorName: rows[0].operator_name,
      price: parseFloat(rows[0].price)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
