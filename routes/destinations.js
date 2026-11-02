const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// GET /api/destinations - public
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find().populate('createdBy', 'name');
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/destinations/:id - public
router.get('/:id', async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id).populate('createdBy', 'name');
    if (!dest) return res.status(404).json({ error: 'Destination not found.' });
    res.json(dest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/destinations - admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const dest = await Destination.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(dest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/destinations/:id - admin only
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Destination deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;