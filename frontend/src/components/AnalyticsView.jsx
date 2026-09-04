import React, { useState, useEffect } from 'react';
import { DollarSign, Compass, Users, UserCheck, TrendingUp, Award, RefreshCw } from 'lucide-react';
import { fetchDbmsAnalytics } from '../services/api';

export default function AnalyticsView() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDbmsAnalytics();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.message || data.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
        Calculating relational aggregations and analytics...
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="badge badge-danger" style={{ padding: '1rem', marginBottom: '1rem' }}>
          ⚠️ {error || 'Could not load analytics data'}
        </div>
        <button className="btn btn-secondary" onClick={loadAnalytics}>
          <RefreshCw size={16} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { summary, categoryStats, topTours, guideWorkload } = analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
            Relational Analytics & Performance Metrics
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Real-time aggregate calculations generated using SQL <code style={{ color: '#38bdf8' }}>COUNT</code>, <code style={{ color: '#38bdf8' }}>SUM</code>, <code style={{ color: '#38bdf8' }}>AVG</code>, and multi-table <code style={{ color: '#38bdf8' }}>GROUP BY</code>.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchAnalytics}>
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card-stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-stat-label">Total Gross Revenue</span>
            <div style={{ padding: '0.4rem', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="card-stat-value" style={{ color: '#10b981' }}>
            ${Number(summary.totalRevenue || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ACID Transaction Payments</span>
        </div>

        <div className="card-stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-stat-label">Active Bookings</span>
            <div style={{ padding: '0.4rem', borderRadius: 8, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="card-stat-value">
            {summary.totalBookings}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Confirmed Expeditions</span>
        </div>

        <div className="card-stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-stat-label">Catalog Tour Packages</span>
            <div style={{ padding: '0.4rem', borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Compass size={20} />
            </div>
          </div>
          <div className="card-stat-value">
            {summary.totalTours}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Curated Itineraries</span>
        </div>

        <div className="card-stat">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-stat-label">Expert Guides & Staff</span>
            <div style={{ padding: '0.4rem', borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div className="card-stat-value">
            {summary.totalGuides}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Multi-lingual Specialists</span>
        </div>
      </div>

      {/* Breakdown by Category & Top Tours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Category Breakdown */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
            Revenue by Tour Category (GROUP BY Query)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoryStats.map(cat => {
              const maxRev = Math.max(...categoryStats.map(c => c.category_revenue || 1));
              const percent = Math.round(((cat.category_revenue || 0) / (maxRev || 1)) * 100);

              return (
                <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <strong style={{ color: '#fff' }}>{cat.category}</strong>
                    <span style={{ color: '#38bdf8' }}>
                      ${Number(cat.category_revenue || 0).toLocaleString()} ({cat.total_bookings} bookings)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-surface)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.max(8, percent)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                      borderRadius: 999
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-performing Tours Table */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#f59e0b" />
            <span>Top Performing Expeditions</span>
          </h3>

          <div className="table-container">
            <table className="dbms-table">
              <thead>
                <tr>
                  <th>Tour Package</th>
                  <th>Country</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topTours.map(t => (
                  <tr key={t.tour_id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{t.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.category} • ★ {Number(t.rating).toFixed(1)}</div>
                    </td>
                    <td>{t.country}</td>
                    <td><span className="badge badge-info">{t.booking_count}</span></td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>${Number(t.revenue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guide Workload Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
          Guide Allocation & Assignment Metrics (Junction Table Analysis)
        </h3>
        <div className="table-container">
          <table className="dbms-table">
            <thead>
              <tr>
                <th>Guide Name</th>
                <th>Languages</th>
                <th>Rating</th>
                <th>Assigned Tours Count</th>
              </tr>
            </thead>
            <tbody>
              {guideWorkload.map(g => (
                <tr key={g.guide_id}>
                  <td><strong style={{ color: '#fff' }}>{g.name}</strong></td>
                  <td>{g.languages}</td>
                  <td><span style={{ color: '#f59e0b' }}>★ {Number(g.rating).toFixed(2)}</span></td>
                  <td><span className="badge badge-success">{g.assigned_tours_count} Tours</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
