const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { verifyToken } = require('../middleware/auth');

// GET /api/reviews/:destinationId - get reviews for a destination
router.get('/:destinationId', async (req, res) => {
  try {
    const reviews = await Review.find({ destination: req.params.destinationId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews - submit a review
router.post('/', verifyToken, async (req, res) => {
  try {
    const { destinationId, rating, comment } = req.body;
    const review = await Review.create({
      user: req.user.id,
      destination: destinationId,
      rating,
      comment
    });
    await review.populate('user', 'name');
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'You have already reviewed this destination.' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id - delete a review (own or admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied.' });
    await review.deleteOne();
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;