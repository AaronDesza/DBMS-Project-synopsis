import { getDb } from '../config/database.js';

// Get all tours with optional search, category, difficulty, maxPrice filters
export async function getAllTours(req, res) {
  try {
    const db = await getDb();
    const { search, category, difficulty, maxPrice, destinationId } = req.query;

    let query = `
      SELECT 
        t.tour_id,
        t.title,
        t.category,
        t.duration_days,
        t.price_per_person,
        t.max_group_size,
        t.difficulty,
        t.rating,
        t.total_reviews,
        t.is_featured,
        t.overview,
        t.image_url,
        d.destination_id,
        d.name AS destination_name,
        d.country AS destination_country,
        d.region AS destination_region
      FROM tours t
      JOIN destinations d ON t.destination_id = d.destination_id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (t.title LIKE ? OR d.name LIKE ? OR d.country LIKE ? OR t.overview LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (category && category !== 'All') {
      query += ` AND t.category = ?`;
      params.push(category);
    }

    if (difficulty && difficulty !== 'All') {
      query += ` AND t.difficulty = ?`;
      params.push(difficulty);
    }

    if (maxPrice) {
      query += ` AND t.price_per_person <= ?`;
      params.push(Number(maxPrice));
    }

    if (destinationId) {
      query += ` AND t.destination_id = ?`;
      params.push(Number(destinationId));
    }

    query += ` ORDER BY t.is_featured DESC, t.rating DESC, t.tour_id ASC`;

    const tours = await db.all(query, params);
    res.json({ success: true, count: tours.length, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get single tour by ID with its itinerary, assigned guides, and recent reviews
export async function getTourById(req, res) {
  try {
    const db = await getDb();
    const { id } = req.params;

    const tour = await db.get(`
      SELECT 
        t.*,
        d.name AS destination_name,
        d.country AS destination_country,
        d.region AS destination_region,
        d.climate,
        d.best_time_to_visit
      FROM tours t
      JOIN destinations d ON t.destination_id = d.destination_id
      WHERE t.tour_id = ?
    `, [id]);

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Fetch Itinerary Days
    const itinerary = await db.all(`
      SELECT * FROM itinerary_items 
      WHERE tour_id = ? 
      ORDER BY day_number ASC
    `, [id]);

    // Fetch Assigned Guides
    const guides = await db.all(`
      SELECT g.*, tg.is_lead 
      FROM guides g
      JOIN tour_guides tg ON g.guide_id = tg.guide_id
      WHERE tg.tour_id = ?
    `, [id]);

    // Fetch Reviews
    const reviews = await db.all(`
      SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.tour_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...tour,
        itinerary,
        guides,
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get all destinations
export async function getAllDestinations(req, res) {
  try {
    const db = await getDb();
    const destinations = await db.all(`
      SELECT d.*, COUNT(t.tour_id) as tour_count
      FROM destinations d
      LEFT JOIN tours t ON d.destination_id = t.destination_id
      GROUP BY d.destination_id
      ORDER BY d.name ASC
    `);
    res.json({ success: true, data: destinations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
