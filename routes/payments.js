const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyToken } = require('../middleware/auth');

// Helper: fetch a fully-populated payment row
async function getPaymentRow(id) {
  const { rows } = await pool.query(
    `SELECT py.*,
            b.user_id, b.travel_date, b.status AS booking_status,
            b.pkg_price, b.hotel_total, b.transport_price, b.total_amount,
            u.name  AS user_name,  u.email AS user_email, u.phone AS user_phone,
            p.package_name, p.duration_days,
            h.hotel_name,   h.price_per_night,
            t.type  AS transport_type, t.operator_name
       FROM payments py
       JOIN bookings      b ON b.id  = py.booking_id
       JOIN users         u ON u.id  = b.user_id
       JOIN tour_packages p ON p.id  = b.package_id
       JOIN hotels        h ON h.id  = b.hotel_id
       JOIN transport     t ON t.id  = b.transport_id
      WHERE py.id = $1`,
    [id]
  );
  return rows[0] || null;
}

// POST /api/payments – pay for a booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookingId, paymentMode } = req.body;

    const bookRes = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookRes.rows[0];
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Return existing payment if already paid
    const existRes = await pool.query('SELECT id FROM payments WHERE booking_id = $1', [bookingId]);
    if (existRes.rows.length) {
      const payment = await getPaymentRow(existRes.rows[0].id);
      return res.status(200).json({ payment, message: 'Booking already paid.' });
    }

    const receiptNo = 'TRB-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

    const { rows } = await pool.query(
      `INSERT INTO payments (booking_id, amount, payment_mode, receipt_no)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [bookingId, booking.total_amount, paymentMode || 'Credit Card', receiptNo]
    );

    // Confirm the booking
    await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [bookingId]);

    const payment = await getPaymentRow(rows[0].id);
    res.status(201).json({ payment, message: 'Payment successful! Booking confirmed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/my – get user's payment receipts
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT py.*,
              b.travel_date, b.status AS booking_status,
              b.pkg_price, b.hotel_total, b.transport_price, b.total_amount,
              p.package_name, p.duration_days,
              h.hotel_name,   h.price_per_night,
              t.type AS transport_type, t.operator_name
         FROM payments py
         JOIN bookings      b ON b.id = py.booking_id
         JOIN tour_packages p ON p.id = b.package_id
         JOIN hotels        h ON h.id = b.hotel_id
         JOIN transport     t ON t.id = b.transport_id
        WHERE b.user_id = $1
        ORDER BY py.payment_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/:id – get single payment receipt
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const payment = await getPaymentRow(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    // Only owner or admin can read
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
