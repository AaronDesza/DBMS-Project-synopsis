import { getDb } from '../config/database.js';

// Add a review and update aggregate ratings for the tour package
export async function addReview(req, res) {
  try {
    const db = await getDb();
    const { tourId, userId = 1, rating, title, comment } = req.body;

    if (!tourId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Missing review details' });
    }

    await db.run('BEGIN TRANSACTION');

    try {
      // 1. Insert review
      await db.run(`
        INSERT INTO reviews (tour_id, user_id, rating, title, comment)
        VALUES (?, ?, ?, ?, ?)
      `, [tourId, userId, rating, title || 'Great Trip!', comment]);

      // 2. Calculate new average rating and count
      const stats = await db.get(`
        SELECT 
          AVG(rating) as avg_rating,
          COUNT(*) as review_count
        FROM reviews
        WHERE tour_id = ?
      `, [tourId]);

      // 3. Update tour table with new rating and review count
      await db.run(`
        UPDATE tours 
        SET rating = ROUND(?, 2), total_reviews = ?
        WHERE tour_id = ?
      `, [stats.avg_rating, stats.review_count, tourId]);

      await db.run('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Review submitted and tour rating updated successfully!',
        data: {
          tourId,
          newRating: Number(stats.avg_rating.toFixed(2)),
          totalReviews: stats.review_count
        }
      });
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
