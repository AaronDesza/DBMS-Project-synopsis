const express = require('express');
const router = express.Router();
const TourPackage = require('../models/TourPackage');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/packages - public
router.get('/', async (req, res) => {
  try {
    const packages = await TourPackage.find().populate('destinations', 'name location category imageUrl');
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/packages/:id - public
router.get('/:id', async (req, res) => {
  try {
    const pkg = await TourPackage.findById(req.params.id).populate('destinations');
    if (!pkg) return res.status(404).json({ error: 'Package not found.' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packages - admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const pkg = await TourPackage.create(req.body);
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/packages/:id - admin only
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await TourPackage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Package deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;