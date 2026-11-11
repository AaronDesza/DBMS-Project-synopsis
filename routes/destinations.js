const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyAdmin } = require('../middleware/auth');

const mapDestination = (d) => ({
  _id: String(d.id),
  id: d.id,
  name: d.name,
  location: d.location,
  category: d.category,
  description: d.description,
  imageUrl: d.image_url,
  image_url: d.image_url,
  createdBy: d.created_by ? { _id: String(d.created_by), id: d.created_by, name: d.created_by_name } : null,
  createdAt: d.created_at,
  created_at: d.created_at
});

// GET /api/destinations – public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.name, d.location, d.category, d.description, d.image_url,
              d.created_at, u.id AS created_by, u.name AS created_by_name
         FROM destinations d
         LEFT JOIN users u ON u.id = d.created_by
        ORDER BY d.id`
    );
    res.json(rows.map(mapDestination));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/destinations/:id – public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.name, d.location, d.category, d.description, d.image_url,
              d.created_at, u.id AS created_by, u.name AS created_by_name
         FROM destinations d
         LEFT JOIN users u ON u.id = d.created_by
        WHERE d.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Destination not found.' });
    res.json(mapDestination(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/destinations – admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const name = req.body.name;
    const location = req.body.location;
    const category = req.body.category;
    const description = req.body.description || '';
    const imageUrl = req.body.imageUrl || req.body.image_url || '';

    const { rows } = await pool.query(
      `INSERT INTO destinations (created_by, name, location, category, description, image_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [req.user.id, name, location, category, description, imageUrl]
    );
    res.status(201).json(mapDestination(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/destinations/:id – admin only
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM destinations WHERE id = $1', [req.params.id]);
    res.json({ message: 'Destination deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
