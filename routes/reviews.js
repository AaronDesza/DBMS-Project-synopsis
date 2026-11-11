const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyToken } = require('../middleware/auth');

const mapReview = (r) => ({
  _id: String(r.id),
  id: r.id,
  rating: r.rating,
  comment: r.comment,
  reviewDate: r.review_date,
  review_date: r.review_date,
  user: {
    _id: String(r.user_id),
    id: r.user_id,
    name: r.user_name
  }
});

// GET /api/reviews/:destinationId – get reviews for a destination
router.get('/:destinationId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.review_date,
              u.id AS user_id, u.name AS user_name
         FROM reviews r
         JOIN users u ON u.id = r.user_id
        WHERE r.destination_id = $1
        ORDER BY r.review_date DESC`,
      [req.params.destinationId]
    );
    res.json(rows.map(mapReview));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews – submit a review (auth required)
router.post('/', verifyToken, async (req, res) => {
  try {
    const destinationId = req.body.destinationId || req.body.destination_id;
    const rating = req.body.rating;
    const comment = req.body.comment;

    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, destination_id, rating, comment)
       VALUES ($1,$2,$3,$4)
       RETURNING id, rating, comment, review_date`,
      [req.user.id, destinationId, rating, comment]
    );
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    const r = {
      ...rows[0],
      user_id: req.user.id,
      user_name: userRes.rows[0]?.name
    };
    res.status(201).json(mapReview(r));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'You have already reviewed this destination.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id – delete a review (own or admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reviews WHERE id = $1', [req.params.id]);
    const review = rows[0];
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
