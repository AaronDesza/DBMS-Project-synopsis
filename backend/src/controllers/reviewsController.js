import { getDb } from '../config/database.js';

// Add a review and update aggregate ratings for the tour package
export async function addReview(req, res) {
  try {
    const db = await getDb();
    const { tourId, userId = 1, rating, title, comment } = req.body;

    const parsedTourId = Number(tourId);
    const parsedRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
    const parsedUserId = Number(userId) || 1;

    if (!parsedTourId || !comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Missing required review details (tourId, comment).' });
    }

    await db.run('BEGIN TRANSACTION');

    try {
      // 1. Insert review
      await db.run(`
        INSERT INTO reviews (tour_id, user_id, rating, title, comment)
        VALUES (?, ?, ?, ?, ?)
      `, [parsedTourId, parsedUserId, parsedRating, (title && title.trim()) || 'Great Trip!', comment.trim()]);

      // 2. Calculate new average rating and count
      const stats = await db.get(`
        SELECT 
          AVG(rating) as avg_rating,
          COUNT(*) as review_count
        FROM reviews
        WHERE tour_id = ?
      `, [parsedTourId]);

      const newAvg = Number(stats.avg_rating || parsedRating);
      const totalReviews = Number(stats.review_count || 1);

      // 3. Update tour table with new rating and review count
      await db.run(`
        UPDATE tours 
        SET rating = ROUND(?, 2), total_reviews = ?
        WHERE tour_id = ?
      `, [newAvg, totalReviews, parsedTourId]);

      await db.run('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Review submitted and tour rating updated successfully!',
        data: {
          tourId: parsedTourId,
          newRating: Number(newAvg.toFixed(2)),
          totalReviews
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
