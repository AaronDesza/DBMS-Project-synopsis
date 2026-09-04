import React, { useState, useEffect } from 'react';
import { Database, Play, Table, Key, Code, Clock, CheckCircle } from 'lucide-react';
import { fetchDbmsSchema, fetchTableRows, executeCustomSqlQuery } from '../services/api';

const PRESET_QUERIES = [
  {
    title: '3-Way Relational JOIN (Tours, Destinations & Guides)',
    sql: `SELECT 
    t.title AS Tour_Name,
    t.category AS Category,
    d.name AS Destination,
    d.country AS Country,
    g.name AS Guide_Name,
    g.languages AS Spoken_Languages
FROM tours t
JOIN destinations d ON t.destination_id = d.destination_id
JOIN tour_guides tg ON t.tour_id = tg.tour_id
JOIN guides g ON tg.guide_id = g.guide_id
ORDER BY t.title ASC;`
  },
  {
    title: 'GROUP BY & Aggregate Revenue Analysis',
    sql: `SELECT 
    t.category,
    COUNT(b.booking_id) AS total_bookings,
    SUM(b.travelers_count) AS total_passengers,
    COALESCE(SUM(b.total_amount), 0) AS gross_revenue_usd,
    ROUND(AVG(t.price_per_person), 2) AS avg_package_price
FROM tours t
LEFT JOIN bookings b ON t.tour_id = b.tour_id AND b.booking_status != 'Cancelled'
GROUP BY t.category
ORDER BY gross_revenue_usd DESC;`
  },
  {
    title: 'Active Bookings with Customer Info & Transaction Status',
    sql: `SELECT 
    b.booking_reference,
    u.full_name AS traveler_name,
    u.email,
    t.title AS tour_title,
    b.travel_date,
    b.total_amount,
    p.transaction_reference,
    p.payment_method,
    p.status AS payment_status
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN tours t ON b.tour_id = t.tour_id
JOIN payments p ON b.booking_id = p.booking_id
ORDER BY b.booking_id DESC;`
  },
  {
    title: 'Tours with Above-Average Rating (Subquery)',
    sql: `SELECT 
    tour_id,
    title,
    category,
    rating,
    price_per_person
FROM tours
WHERE rating > (SELECT AVG(rating) FROM tours)
ORDER BY rating DESC;`
  },
  {
    title: 'Relational View: view_tour_summary',
    sql: `SELECT * FROM view_tour_summary;`
  }
];

export default function DbmsExplorer() {
  const [schemaData, setSchemaData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('tours');
  const [tableData, setTableData] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState(PRESET_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [queryError, setQueryError] = useState(null);

  const loadSchema = async () => {
    try {
      const data = await fetchDbmsSchema();
      if (data.success) {
        setSchemaData(data.data);
      }
    } catch (err) {
      console.error('Failed to load schema', err);
    }
  };

  const loadTableRows = async (tableName) => {
    try {
      setLoadingTable(true);
      const data = await fetchTableRows(tableName);
      if (data.success) {
        setTableData(data);
      }
    } catch (err) {
      console.error('Failed to fetch table rows', err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    loadSchema();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableRows(selectedTable);
    }
  }, [selectedTable]);

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    try {
      setExecuting(true);
      setQueryError(null);
      const data = await executeCustomSqlQuery(sqlQuery);
      if (data.success) {
        setQueryResult(data);
      } else {
        setQueryError(data.error || data.message || 'SQL Execution error');
        setQueryResult(null);
      }
    } catch (err) {
      setQueryError(err.message);
      setQueryResult(null);
    } finally {
      setExecuting(false);
    }
  };

  const activeTableMeta = schemaData?.tables?.find(t => t.name === selectedTable);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: 8,
            background: 'rgba(2, 132, 199, 0.2)',
            color: '#38bdf8'
          }}>
            <Database size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
              DBMS Relational Explorer & SQL Console
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Inspect live database tables, foreign-key relationships, and execute custom SQL queries in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* SQL Playground Section */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#38bdf8' }}>
            <Code size={18} />
            <span>Interactive SQL Playground</span>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={() => setSqlQuery(preset.sql)}
              >
                Sample Query #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* SQL Editor Area */}
        <div className="sql-editor-container">
          <div className="sql-editor-header">
            <span>SQL Query Statement</span>
            <span>Relational DBMS Engine (SQLite3 / SQL Dialect)</span>
          </div>
          <textarea
            className="sql-textarea"
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            rows={5}
            placeholder="Type any SQL query here (e.g. SELECT * FROM tours JOIN destinations...)"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Supports: <code style={{ color: '#38bdf8' }}>SELECT</code>, <code style={{ color: '#38bdf8' }}>JOIN</code>, <code style={{ color: '#38bdf8' }}>GROUP BY</code>, <code style={{ color: '#38bdf8' }}>HAVING</code>, <code style={{ color: '#38bdf8' }}>EXPLAIN QUERY PLAN</code>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleRunQuery}
            disabled={executing}
            style={{ padding: '0.65rem 1.5rem' }}
          >
            <Play size={16} fill="#fff" />
            <span>{executing ? 'Executing SQL...' : 'Run Query'}</span>
          </button>
        </div>

        {/* Query Output */}
        {queryError && (
          <div className="badge badge-danger" style={{ padding: '0.875rem', borderRadius: 8 }}>
            ❌ SQL Error: {queryError}
          </div>
        )}

        {queryResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span className="badge badge-success">
                <CheckCircle size={14} />
                <span>Returned {queryResult.rowCount} record(s)</span>
              </span>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> Execution Time: <strong style={{ color: '#38bdf8' }}>{queryResult.executionTimeMs}</strong>
              </span>
            </div>

            {queryResult.columns && queryResult.columns.length > 0 ? (
              <div className="table-container" style={{ maxHeight: 350 }}>
                <table className="dbms-table">
                  <thead>
                    <tr>
                      {queryResult.columns.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.data.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {queryResult.columns.map(col => (
                          <td key={col}>
                            {row[col] === null ? (
                              <span style={{ color: '#64748b', fontStyle: 'italic' }}>NULL</span>
                            ) : typeof row[col] === 'boolean' ? (
                              row[col] ? 'TRUE' : 'FALSE'
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Query executed successfully. Changes: {queryResult.rowCount}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Relational Table Schema & Raw Data Inspector */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fff', fontSize: '1.15rem' }}>
          <Table size={20} color="#38bdf8" />
          <span>Relational Tables & Schema Inspector</span>
        </div>

        {/* Table Selector Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {schemaData?.tables?.map(t => (
            <button
              key={t.name}
              className={`category-pill ${selectedTable === t.name ? 'active' : ''}`}
              onClick={() => setSelectedTable(t.name)}
            >
              📋 {t.name} <span style={{ opacity: 0.65 }}>({t.rowCount} rows)</span>
            </button>
          ))}
          {schemaData?.views?.map(v => (
            <button
              key={v.name}
              className={`category-pill ${selectedTable === v.name ? 'active' : ''}`}
              onClick={() => setSelectedTable(v.name)}
              style={{ borderColor: '#818cf8' }}
            >
              👁️ View: {v.name}
            </button>
          ))}
        </div>

        {/* Column Definitions & Foreign Keys */}
        {activeTableMeta && (
          <div style={{
            background: 'var(--bg-surface)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.85rem' }}>
              Column Definitions for `{activeTableMeta.name}`
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {activeTableMeta.columns.map(col => (
                <div
                  key={col.name}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: 'var(--bg-card)',
                    border: col.isPrimaryKey ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {col.isPrimaryKey && <Key size={12} color="#f59e0b" />}
                  <strong style={{ color: col.isPrimaryKey ? '#f59e0b' : '#fff' }}>{col.name}</strong>
                  <span style={{ color: '#94a3b8' }}>({col.type})</span>
                </div>
              ))}
            </div>

            {activeTableMeta.foreignKeys.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#a855f7' }}>
                🔗 <strong>Foreign Keys:</strong> {activeTableMeta.foreignKeys.map(fk => `${fk.column} ➔ ${fk.referencedTable}(${fk.referencedColumn})`).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Raw Rows Table */}
        {loadingTable ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Loading table data...
          </div>
        ) : tableData && tableData.data && tableData.data.length > 0 ? (
          <div className="table-container" style={{ maxHeight: 380 }}>
            <table className="dbms-table">
              <thead>
                <tr>
                  {Object.keys(tableData.data[0]).map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(tableData.data[0]).map(col => (
                      <td key={col}>
                        {row[col] === null ? (
                          <span style={{ color: '#64748b' }}>NULL</span>
                        ) : typeof row[col] === 'boolean' ? (
                          row[col] ? '1' : '0'
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: '#94a3b8', padding: '1rem', textAlign: 'center' }}>
            No records in this table currently.
          </div>
        )}
      </div>
    </div>
  );
}
