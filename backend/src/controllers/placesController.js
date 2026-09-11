import { getDb } from '../config/database.js';

/**
 * GET /api/places
 * Supports: ?country=, ?category=, ?search=, ?continent=, ?era=
 */
export async function getAllPlaces(req, res) {
  try {
    const { country, category, search, continent, era } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM historical_places WHERE 1=1';
    const params = [];

    if (country) {
      query += ' AND LOWER(country) = LOWER(?)';
      params.push(country);
    }
    if (category) {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }
    if (continent && continent !== 'All') {
      query += ' AND continent = ?';
      params.push(continent);
    }
    if (era) {
      query += ' AND LOWER(era) LIKE LOWER(?)';
      params.push(`%${era}%`);
    }
    if (search) {
      query += ' AND (name LIKE ? OR country LIKE ? OR city LIKE ? OR description LIKE ? OR era LIKE ? OR category LIKE ?)';
      const p = `%${search}%`;
      params.push(p, p, p, p, p, p);
    }

    query += ' ORDER BY name ASC';

    const places = await db.all(query, params);

    res.json({ success: true, count: places.length, data: places });
  } catch (error) {
    console.error('Error fetching historical places:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch historical places', error: error.message });
  }
}

/**
 * GET /api/places/:id
 */
export async function getPlaceById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const place = await db.get('SELECT * FROM historical_places WHERE place_id = ?', [id]);

    if (!place) {
      return res.status(404).json({ success: false, message: `Historical place with ID ${id} not found` });
    }

    // Enrich: also return associated tours (by country match)
    const associatedTours = await db.all(
      `SELECT t.tour_id, t.title, t.category, t.price_per_person, t.duration_days, t.rating, t.image_url,
              d.name AS destination_name
       FROM tours t
       JOIN destinations d ON t.destination_id = d.destination_id
       WHERE LOWER(d.country) = LOWER(?)
       LIMIT 5`,
      [place.country]
    );

    res.json({ success: true, data: { ...place, associatedTours } });
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch historical place details', error: error.message });
  }
}

/**
 * POST /api/places  (admin only)
 */
export async function createPlace(req, res) {
  try {
    const {
      name, country, city, description,
      category, era, century,
      latitude, longitude, image_url,
      continent, significance, year_built,
      entry_fee, visiting_hours
    } = req.body;

    if (!name || !country) {
      return res.status(400).json({ success: false, message: 'Name and country are required' });
    }

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO historical_places
       (name, country, city, description, category, era, century, latitude, longitude,
        image_url, continent, significance, year_built, entry_fee, visiting_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(), country.trim(),
        city || '',
        description || '',
        category || 'Monument',
        era || 'Unknown',
        century || null,
        latitude || null, longitude || null,
        image_url || 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
        continent || 'Global',
        significance || '',
        year_built || 'Unknown',
        entry_fee || 0,
        visiting_hours || '09:00 AM - 05:00 PM'
      ]
    );

    const newPlace = await db.get('SELECT * FROM historical_places WHERE place_id = ?', [result.lastID]);
    res.status(201).json({ success: true, message: 'Historical place added successfully', data: newPlace });
  } catch (error) {
    console.error('Error creating historical place:', error);
    res.status(500).json({ success: false, message: 'Failed to create historical place', error: error.message });
  }
}

/**
 * PUT /api/places/:id  (admin only)
 */
export async function updatePlace(req, res) {
  try {
    const { id } = req.params;
    const {
      name, country, city, description,
      category, era, century,
      latitude, longitude, image_url,
      continent, significance, year_built,
      entry_fee, visiting_hours
    } = req.body;

    const db = await getDb();

    const existing = await db.get('SELECT place_id FROM historical_places WHERE place_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Place with ID ${id} not found` });
    }

    await db.run(
      `UPDATE historical_places SET
        name           = COALESCE(?, name),
        country        = COALESCE(?, country),
        city           = COALESCE(?, city),
        description    = COALESCE(?, description),
        category       = COALESCE(?, category),
        era            = COALESCE(?, era),
        century        = COALESCE(?, century),
        latitude       = COALESCE(?, latitude),
        longitude      = COALESCE(?, longitude),
        image_url      = COALESCE(?, image_url),
        continent      = COALESCE(?, continent),
        significance   = COALESCE(?, significance),
        year_built     = COALESCE(?, year_built),
        entry_fee      = COALESCE(?, entry_fee),
        visiting_hours = COALESCE(?, visiting_hours)
       WHERE place_id = ?`,
      [
        name, country, city, description,
        category, era, century,
        latitude, longitude, image_url,
        continent, significance, year_built,
        entry_fee, visiting_hours, id
      ]
    );

    const updated = await db.get('SELECT * FROM historical_places WHERE place_id = ?', [id]);
    res.json({ success: true, message: 'Historical place updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating historical place:', error);
    res.status(500).json({ success: false, message: 'Failed to update historical place', error: error.message });
  }
}

/**
 * DELETE /api/places/:id  (admin only)
 */
export async function deletePlace(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const existing = await db.get('SELECT place_id, name FROM historical_places WHERE place_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Place with ID ${id} not found` });
    }

    await db.run('DELETE FROM historical_places WHERE place_id = ?', [id]);
    res.json({ success: true, message: `"${existing.name}" has been removed successfully` });
  } catch (error) {
    console.error('Error deleting historical place:', error);
    res.status(500).json({ success: false, message: 'Failed to delete historical place', error: error.message });
  }
}
