const express = require('express');
const router  = express.Router();
const pool    = require('../backend/db/pool');
const { verifyAdmin } = require('../middleware/auth');

const mapPackage = (p) => {
  const destObj = p.destination_name ? {
    _id: String(p.destination_id),
    id: p.destination_id,
    name: p.destination_name,
    location: p.location,
    category: p.category,
    description: p.description,
    imageUrl: p.image_url,
    image_url: p.image_url
  } : null;

  return {
    _id: String(p.id),
    id: p.id,
    packageName: p.package_name,
    package_name: p.package_name,
    durationDays: p.duration_days,
    duration_days: p.duration_days,
    price: parseFloat(p.price),
    details: p.details || p.description || 'Guided tour with heritage sightseeing, deluxe hotel stay, and transfers.',
    imageUrl: p.package_image || p.image_url || '',
    image_url: p.package_image || p.image_url || '',
    destination_id: p.destination_id,
    destinations: destObj ? [destObj] : [],
    createdAt: p.created_at,
    created_at: p.created_at
  };
};

// GET /api/packages – public
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.package_name, p.duration_days, p.price, p.created_at,
              d.id AS destination_id, d.name AS destination_name,
              d.location, d.category, d.description, d.image_url
         FROM tour_packages p
         LEFT JOIN destinations d ON d.id = p.destination_id
        ORDER BY p.id`
    );
    res.json(rows.map(mapPackage));
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
    res.json(mapPackage(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packages – admin only
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const packageName = req.body.packageName || req.body.package_name;
    const durationDays = req.body.durationDays || req.body.duration_days;
    const price = req.body.price;
    const destinationId = req.body.destinationId || req.body.destination_id || null;

    const { rows } = await pool.query(
      `INSERT INTO tour_packages (created_by, package_name, duration_days, price, destination_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [req.user.id, packageName, durationDays, price, destinationId]
    );
    res.status(201).json(mapPackage(rows[0]));
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
