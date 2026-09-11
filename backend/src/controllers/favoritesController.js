import { getDb } from '../config/database.js';

/**
 * GET /api/favorites
 * Query: ?userId= (optional)
 * Returns all favorites or filtered by userId
 */
export async function getAllFavorites(req, res) {
  try {
    const db = await getDb();
    const userId = req.query.userId || (req.user ? req.user.userId : null);

    let query = `
      SELECT f.favorite_id, f.user_id, f.saved_at,
             hp.place_id, hp.name, hp.country, hp.city, hp.category,
             hp.era, hp.image_url, hp.latitude, hp.longitude, hp.continent
      FROM favorites f
      JOIN historical_places hp ON f.place_id = hp.place_id
    `;
    const params = [];

    if (userId) {
      query += ` WHERE f.user_id = ?`;
      params.push(Number(userId));
    }

    query += ` ORDER BY f.saved_at DESC`;

    const favorites = await db.all(query, params);
    res.json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch favorites', error: error.message });
  }
}

/**
 * POST /api/favorites
 * Body: { placeId }
 * Requires: JWT auth (user_id comes from token)
 */
export async function addFavorite(req, res) {

  try {
    const { placeId } = req.body;
    const userId = req.user.userId;

    if (!placeId) {
      return res.status(400).json({ success: false, message: 'placeId is required' });
    }

    const db = await getDb();

    // Verify the place exists
    const place = await db.get('SELECT place_id, name FROM historical_places WHERE place_id = ?', [placeId]);
    if (!place) {
      return res.status(404).json({ success: false, message: `Place with ID ${placeId} not found` });
    }

    // Check if already favorited
    const existing = await db.get(
      'SELECT favorite_id FROM favorites WHERE user_id = ? AND place_id = ?',
      [userId, placeId]
    );
    if (existing) {
      return res.status(409).json({ success: false, message: 'Place already in your favorites' });
    }

    const result = await db.run(
      'INSERT INTO favorites (user_id, place_id) VALUES (?, ?)',
      [userId, placeId]
    );

    res.status(201).json({
      success: true,
      message: `"${place.name}" added to favorites`,
      data: { favoriteId: result.lastID, userId, placeId, placeName: place.name }
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ success: false, message: 'Failed to add favorite', error: error.message });
  }
}

/**
 * GET /api/favorites/:userId
 * Returns all historical places saved by a user
 */
export async function getFavoritesByUser(req, res) {
  try {
    const { userId } = req.params;

    // Security: users can only see their own favorites, admins can see anyone's
    if (req.user.userId !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: you can only view your own favorites' });
    }

    const db = await getDb();

    const user = await db.get('SELECT user_id FROM users WHERE user_id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: `User with ID ${userId} not found` });
    }

    const favorites = await db.all(
      `SELECT f.favorite_id, f.saved_at,
              hp.place_id, hp.name, hp.country, hp.city, hp.category,
              hp.era, hp.image_url, hp.latitude, hp.longitude, hp.continent
       FROM favorites f
       JOIN historical_places hp ON f.place_id = hp.place_id
       WHERE f.user_id = ?
       ORDER BY f.saved_at DESC`,
      [userId]
    );

    res.json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch favorites', error: error.message });
  }
}

/**
 * DELETE /api/favorites/:placeId
 * Removes a specific favorite for the authenticated user
 */
export async function removeFavorite(req, res) {
  try {
    const { placeId } = req.params;
    const userId = req.user.userId;
    const db = await getDb();

    const fav = await db.get(
      'SELECT f.favorite_id, hp.name FROM favorites f JOIN historical_places hp ON f.place_id = hp.place_id WHERE f.user_id = ? AND f.place_id = ?',
      [userId, placeId]
    );

    if (!fav) {
      return res.status(404).json({ success: false, message: 'Favorite not found for this user and place' });
    }

    await db.run('DELETE FROM favorites WHERE user_id = ? AND place_id = ?', [userId, placeId]);
    res.json({ success: true, message: `"${fav.name}" removed from favorites` });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ success: false, message: 'Failed to remove favorite', error: error.message });
  }
}
