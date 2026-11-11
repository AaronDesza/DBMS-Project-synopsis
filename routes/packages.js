const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/packages – public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.package_name, p.duration_days, p.price, p.created_at,
              d.id AS destination_id, d.name AS destination_name,
              d.location, d.category, d.image_url
         FROM tour_packages p
         LEFT JOIN destinations d ON d.id = p.destination_id
        ORDER BY p.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/packages/:id – public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.package_name, p.duration_days, p.price, p.created_at,
              d.id AS destination_id, d.name AS destination_name,
              d.location, d.category, d.description, d.image_url
         FROM tour_packages p
         LEFT JOIN destinations d ON d.id = p.destination_id
        WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Package not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packages – admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { package_name, duration_days, price, destination_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO tour_packages (created_by, package_name, duration_days, price, destination_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [req.user.id, package_name, duration_days, price, destination_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/packages/:id – admin only
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM tour_packages WHERE id = $1', [req.params.id]);
    res.json({ message: 'Package deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
