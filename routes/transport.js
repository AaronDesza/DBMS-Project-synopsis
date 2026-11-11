const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/transport – public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transport ORDER BY price ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transport/:id – public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transport WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Transport not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transport – admin only
router.post('/', verifyAdmin, async (req, res) => {
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
