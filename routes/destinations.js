const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// GET /api/destinations – public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.id AS _id, d.name, d.location, d.category, d.description,
              d.image_url, d.image_url AS "imageUrl",
              d.created_at, u.name AS created_by_name
         FROM destinations d
         LEFT JOIN users u ON u.id = d.created_by
        ORDER BY d.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/destinations/:id – public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.id AS _id, d.name, d.location, d.category, d.description,
              d.image_url, d.image_url AS "imageUrl",
              d.created_at, u.name AS created_by_name
         FROM destinations d
         LEFT JOIN users u ON u.id = d.created_by
        WHERE d.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Destination not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/destinations – admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, location, category, description, image_url } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO destinations (created_by, name, location, category, description, image_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [req.user.id, name, location, category, description || '', image_url || '']
    );
    res.status(201).json(rows[0]);
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
