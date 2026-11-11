const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyToken } = require('../middleware/auth');

const mapBooking = (b) => {
  if (!b) return null;
  return {
    _id: String(b.id),
    id: b.id,
    user: {
      _id: String(b.user_id),
      id: b.user_id,
      name: b.user_name,
      email: b.user_email,
      phone: b.user_phone
    },
    package: {
      _id: String(b.package_id),
      id: b.package_id,
      packageName: b.package_name,
      package_name: b.package_name,
      durationDays: b.duration_days,
      duration_days: b.duration_days,
      price: parseFloat(b.pkg_list_price || b.pkg_price || 0),
      destinations: b.destination_name ? [{ name: b.destination_name, imageUrl: b.destination_image }] : []
    },
    hotel: {
      _id: String(b.hotel_id),
      id: b.hotel_id,
      hotelName: b.hotel_name,
      hotel_name: b.hotel_name,
      pricePerNight: parseFloat(b.price_per_night || 0),
      rating: parseFloat(b.hotel_rating || 0)
    },
    transport: {
      _id: String(b.transport_id),
      id: b.transport_id,
      type: b.transport_type,
      operatorName: b.operator_name,
      operator_name: b.operator_name,
      price: parseFloat(b.transport_list_price || b.transport_price || 0)
    },
    travelDate: b.travel_date,
    travel_date: b.travel_date,
    priceBreakdown: {
      packagePrice: parseFloat(b.pkg_price || 0),
      hotelTotal: parseFloat(b.hotel_total || 0),
      transportPrice: parseFloat(b.transport_price || 0)
    },
    totalAmount: parseFloat(b.total_amount || 0),
    total_amount: parseFloat(b.total_amount || 0),
    status: b.status,
    bookingDate: b.booking_date,
    booking_date: b.booking_date
  };
};

// Helper: fetch a fully-joined booking row
async function getBookingRow(id) {
  const { rows } = await pool.query(
    `SELECT b.*,
            u.name  AS user_name,  u.email AS user_email, u.phone AS user_phone,
            p.package_name, p.duration_days, p.price AS pkg_list_price,
            h.hotel_name,   h.price_per_night, h.rating AS hotel_rating,
            t.type  AS transport_type, t.operator_name, t.price AS transport_list_price,
            d.name  AS destination_name, d.image_url AS destination_image
       FROM bookings b
       JOIN users        u ON u.id = b.user_id
       JOIN tour_packages p ON p.id = b.package_id
       JOIN hotels       h ON h.id = b.hotel_id
       JOIN transport    t ON t.id = b.transport_id
       LEFT JOIN destinations d ON d.id = p.destination_id
      WHERE b.id = $1`,
    [id]
  );
  return rows[0] || null;
}

// POST /api/bookings – create booking (auth required)
router.post('/', verifyToken, async (req, res) => {
  try {
    const packageId = req.body.packageId || req.body.package_id;
    const hotelId = req.body.hotelId || req.body.hotel_id;
    const transportId = req.body.transportId || req.body.transport_id;
    const travelDate = req.body.travelDate || req.body.travel_date;

    const [pkgRes, hotelRes, transRes] = await Promise.all([
      pool.query('SELECT id, price, duration_days FROM tour_packages WHERE id = $1', [packageId]),
      pool.query('SELECT id, price_per_night FROM hotels WHERE id = $1', [hotelId]),
      pool.query('SELECT id, price FROM transport WHERE id = $1', [transportId])
    ]);

    const pkg       = pkgRes.rows[0];
    const hotel     = hotelRes.rows[0];
    const transport = transRes.rows[0];
    if (!pkg || !hotel || !transport) {
      return res.status(404).json({ error: 'Invalid booking references.' });
    }

    const pkgPrice       = parseFloat(pkg.price);
    const hotelTotal     = parseFloat(hotel.price_per_night) * pkg.duration_days;
    const transportPrice = parseFloat(transport.price);
    const totalAmount    = pkgPrice + hotelTotal + transportPrice;

    const { rows } = await pool.query(
      `INSERT INTO bookings
         (user_id, package_id, hotel_id, transport_id, travel_date,
          pkg_price, hotel_total, transport_price, total_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')
       RETURNING id`,
      [req.user.id, packageId, hotelId, transportId, travelDate,
       pkgPrice, hotelTotal, transportPrice, totalAmount]
    );

    const booking = await getBookingRow(rows[0].id);
    res.status(201).json(mapBooking(booking));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/my – get user's own bookings
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*,
              u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
              p.package_name, p.duration_days, p.price AS pkg_list_price,
              h.hotel_name,   h.price_per_night, h.rating AS hotel_rating,
              t.type AS transport_type, t.operator_name, t.price AS transport_list_price,
              d.name AS destination_name, d.image_url AS destination_image
         FROM bookings b
         JOIN users         u ON u.id = b.user_id
         JOIN tour_packages p ON p.id = b.package_id
         JOIN hotels        h ON h.id = b.hotel_id
         JOIN transport     t ON t.id = b.transport_id
         LEFT JOIN destinations d ON d.id = p.destination_id
        WHERE b.user_id = $1
        ORDER BY b.booking_date DESC`,
      [req.user.id]
    );
    res.json(rows.map(mapBooking));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id – get single booking
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await getBookingRow(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(mapBooking(booking));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/cancel – cancel a booking
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    const booking = rows[0];
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
      [req.params.id]
    );
    const updated = await getBookingRow(req.params.id);
    res.json({ message: 'Booking cancelled.', booking: mapBooking(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
