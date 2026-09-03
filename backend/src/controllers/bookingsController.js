import { getDb } from '../config/database.js';

// Get all bookings (with full join info for dashboard / admin)
export async function getAllBookings(req, res) {
  try {
    const db = await getDb();
    const { userId, status } = req.query;

    let query = `
      SELECT 
        b.booking_id,
        b.booking_reference,
        b.booking_date,
        b.travel_date,
        b.travelers_count,
        b.unit_price,
        b.total_amount,
        b.special_requests,
        b.booking_status,
        b.payment_status,
        u.user_id,
        u.full_name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        t.tour_id,
        t.title AS tour_title,
        t.category AS tour_category,
        t.duration_days,
        t.image_url AS tour_image,
        d.name AS destination_name,
        d.country AS destination_country
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN tours t ON b.tour_id = t.tour_id
      JOIN destinations d ON t.destination_id = d.destination_id
      WHERE 1=1
    `;

    const params = [];
    if (userId) {
      query += ` AND b.user_id = ?`;
      params.push(userId);
    }
    if (status) {
      query += ` AND b.booking_status = ?`;
      params.push(status);
    }

    query += ` ORDER BY b.booking_date DESC`;

    const bookings = await db.all(query, params);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create a new booking with transactional safety
export async function createBooking(req, res) {
  try {
    const db = await getDb();
    const {
      userId = 1, // Default to demo traveler Alex Rivera
      fullName,
      email,
      phone,
      tourId,
      travelDate,
      travelersCount,
      specialRequests = '',
      paymentMethod = 'Credit Card'
    } = req.body;

    if (!tourId || !travelDate || !travelersCount) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields.' });
    }

    // Begin Transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // 1. If customer email provided and user not found, create user
      let finalUserId = userId;
      if (email && (!finalUserId || finalUserId === 1)) {
        const existingUser = await db.get('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existingUser) {
          finalUserId = existingUser.user_id;
        } else if (fullName) {
          const userInsert = await db.run(
            'INSERT INTO users (full_name, email, phone, role) VALUES (?, ?, ?, ?)',
            [fullName, email, phone || null, 'traveler']
          );
          finalUserId = userInsert.lastID;
        }
      }

      // 2. Fetch Tour Info to compute prices
      const tour = await db.get('SELECT * FROM tours WHERE tour_id = ?', [tourId]);
      if (!tour) {
        await db.run('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Tour package not found.' });
      }

      const unitPrice = tour.price_per_person;
      const totalAmount = unitPrice * Number(travelersCount);
      const bookingRef = `TRV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // 3. Insert Booking Record
      const bookingResult = await db.run(`
        INSERT INTO bookings (
          booking_reference, user_id, tour_id, travel_date, travelers_count, 
          unit_price, total_amount, special_requests, booking_status, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Paid')
      `, [bookingRef, finalUserId, tourId, travelDate, travelersCount, unitPrice, totalAmount, specialRequests]);

      const bookingId = bookingResult.lastID;

      // 4. Insert Payment Record
      const txnRef = `TXN-${Date.now().toString().slice(-8)}`;
      await db.run(`
        INSERT INTO payments (booking_id, transaction_reference, amount, payment_method, status)
        VALUES (?, ?, ?, ?, 'Success')
      `, [bookingId, txnRef, totalAmount, paymentMethod]);

      // Commit Transaction
      await db.run('COMMIT');

      // Fetch created booking summary
      const newBooking = await db.get(`
        SELECT 
          b.*,
          u.full_name AS customer_name,
          u.email AS customer_email,
          t.title AS tour_title,
          d.name AS destination_name,
          d.country AS destination_country
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN tours t ON b.tour_id = t.tour_id
        JOIN destinations d ON t.destination_id = d.destination_id
        WHERE b.booking_id = ?
      `, [bookingId]);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully!',
        data: newBooking
      });
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Cancel booking
export async function cancelBooking(req, res) {
  try {
    const db = await getDb();
    const { id } = req.params;

    const result = await db.run(`
      UPDATE bookings 
      SET booking_status = 'Cancelled', payment_status = 'Refunded' 
      WHERE booking_id = ?
    `, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking cancelled and refund processed.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
