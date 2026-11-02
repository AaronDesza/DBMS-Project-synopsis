const express = require('express');
const router = express.Router();
const Transport = require('../models/Transport');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/transport - list all available transport options (public/travellers)
router.get('/', async (req, res) => {
  try {
    const transport = await Transport.find().sort({ price: 1 });
    res.json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transport/:id - get single transport option
router.get('/:id', async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) return res.status(404).json({ error: 'Transport not found.' });
    res.json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transport - add transport (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const transport = await Transport.create(req.body);
    res.status(201).json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
