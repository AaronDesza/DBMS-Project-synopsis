const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyAdmin } = require('../middleware/auth');

const mapTransport = (t) => ({
  _id: String(t.id),
  id: t.id,
  type: t.type,
  operatorName: t.operator_name,
  operator_name: t.operator_name,
  price: parseFloat(t.price)
});

// GET /api/transport – public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transport ORDER BY price ASC');
    res.json(rows.map(mapTransport));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transport/:id – public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transport WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Transport not found.' });
    res.json(mapTransport(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transport – admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const type = req.body.type;
    const opName = req.body.operatorName || req.body.operator_name;
    const price = req.body.price;
    const { rows } = await pool.query(
      'INSERT INTO transport (type, operator_name, price) VALUES ($1,$2,$3) RETURNING *',
      [type, opName, price]
    );
    res.status(201).json(mapTransport(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
