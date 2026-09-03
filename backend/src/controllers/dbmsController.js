import { getDb } from '../config/database.js';

// Get schema overview: all tables, row counts, and column definitions
export async function getDatabaseSchema(req, res) {
  try {
    const db = await getDb();

    // Get all user tables
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name ASC
    `);

    const tableMetadata = [];

    for (const table of tables) {
      const tableName = table.name;
      // Get column definitions
      const columns = await db.all(`PRAGMA table_info(${tableName})`);
      // Get foreign keys
      const foreignKeys = await db.all(`PRAGMA foreign_key_list(${tableName})`);
      // Get row count
      const countRes = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);

      tableMetadata.push({
        name: tableName,
        rowCount: countRes.count,
        columns: columns.map(c => ({
          name: c.name,
          type: c.type,
          notNull: !!c.notnull,
          isPrimaryKey: !!c.pk,
          defaultValue: c.dflt_value
        })),
        foreignKeys: foreignKeys.map(fk => ({
          column: fk.from,
          referencedTable: fk.table,
          referencedColumn: fk.to,
          onDelete: fk.on_delete,
          onUpdate: fk.on_update
        }))
      });
    }

    // Get views
    const views = await db.all(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='view'
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: {
        tables: tableMetadata,
        views
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get rows of a specific table
export async function getTableData(req, res) {
  try {
    const db = await getDb();
    const { tableName } = req.params;
    const limit = Number(req.query.limit) || 50;

    // Guard against SQL injection on table name
    const validTable = await db.get(
      "SELECT name FROM sqlite_master WHERE (type='table' OR type='view') AND name = ?",
      [tableName]
    );

    if (!validTable) {
      return res.status(404).json({ success: false, message: 'Table or view not found' });
    }

    const rows = await db.all(`SELECT * FROM ${tableName} LIMIT ?`, [limit]);
    const totalCount = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);

    res.json({
      success: true,
      tableName,
      totalCount: totalCount.count,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// Execute live custom SQL query (with execution time telemetry for DBMS demonstration)
export async function executeSqlQuery(req, res) {
  try {
    const db = await getDb();
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'No SQL query provided' });
    }

    const trimmed = query.trim();
    const isSelect = trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('EXPLAIN') || trimmed.toUpperCase().startsWith('WITH');

    const startTime = process.hrtime();

    let result;
    if (isSelect) {
      result = await db.all(trimmed);
    } else {
      result = await db.run(trimmed);
    }

    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    res.json({
      success: true,
      isSelect,
      executionTimeMs: `${executionTimeMs} ms`,
      rowCount: Array.isArray(result) ? result.length : result.changes || 0,
      columns: Array.isArray(result) && result.length > 0 ? Object.keys(result[0]) : [],
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// Analytics and Aggregation Metrics
export async function getAnalytics(req, res) {
  try {
    const db = await getDb();

    // 1. Overall stats
    const totalBookings = await db.get("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total_revenue FROM bookings WHERE booking_status != 'Cancelled'");
    const totalTours = await db.get("SELECT COUNT(*) as count FROM tours");
    const totalUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'traveler'");
    const totalGuides = await db.get("SELECT COUNT(*) as count FROM guides");

    // 2. Revenue & Bookings by Tour Category
    const categoryStats = await db.all(`
      SELECT 
        t.category,
        COUNT(b.booking_id) as total_bookings,
        COALESCE(SUM(b.total_amount), 0) as category_revenue,
        ROUND(AVG(t.price_per_person), 2) as avg_tour_price
      FROM tours t
      LEFT JOIN bookings b ON t.tour_id = b.tour_id AND b.booking_status != 'Cancelled'
      GROUP BY t.category
      ORDER BY category_revenue DESC
    `);

    // 3. Top-rated and most-booked tours (Complex Relational Join)
    const topTours = await db.all(`
      SELECT 
        t.tour_id,
        t.title,
        t.category,
        t.rating,
        d.country,
        COUNT(b.booking_id) as booking_count,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM tours t
      JOIN destinations d ON t.destination_id = d.destination_id
      LEFT JOIN bookings b ON t.tour_id = b.tour_id AND b.booking_status != 'Cancelled'
      GROUP BY t.tour_id
      ORDER BY booking_count DESC, revenue DESC
      LIMIT 5
    `);

    // 4. Guide Workload & Ratings
    const guideWorkload = await db.all(`
      SELECT 
        g.guide_id,
        g.name,
        g.rating,
        g.languages,
        COUNT(tg.tour_id) as assigned_tours_count
      FROM guides g
      LEFT JOIN tour_guides tg ON g.guide_id = tg.guide_id
      GROUP BY g.guide_id
      ORDER BY assigned_tours_count DESC
    `);

    res.json({
      success: true,
      data: {
        summary: {
          totalBookings: totalBookings.count,
          totalRevenue: totalBookings.total_revenue,
          totalTours: totalTours.count,
          totalUsers: totalUsers.count,
          totalGuides: totalGuides.count
        },
        categoryStats,
        topTours,
        guideWorkload
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
