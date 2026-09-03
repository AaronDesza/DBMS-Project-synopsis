import React from 'react';
import { Layers, ShieldCheck, Database, GitBranch, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
          DBMS System Architecture & ER Documentation
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Comprehensive technical overview for project viva, synopsis presentation, and schema review.
        </p>
      </div>

      {/* Relational ER Entity Cards */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '1.15rem' }}>
          <Database size={20} />
          <span>Entity-Relationship (ER) Schema Map</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Entity 1 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#fff' }}>1. users</strong>
              <span className="badge badge-info">Master</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
              🔑 <code style={{ color: '#f59e0b' }}>user_id (PK)</code><br />
              • full_name, email (UNIQUE), phone<br />
              • role ('traveler' | 'admin' | 'guide')<br />
              • created_at
            </div>
          </div>

          {/* Entity 2 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#fff' }}>2. destinations</strong>
              <span className="badge badge-info">Master</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
              🔑 <code style={{ color: '#f59e0b' }}>destination_id (PK)</code><br />
              • name, country, region, climate<br />
              • description, image_url<br />
              • best_time_to_visit
            </div>
          </div>

          {/* Entity 3 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#fff' }}>3. tours</strong>
              <span className="badge badge-success">Core 1:N</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
              🔑 <code style={{ color: '#f59e0b' }}>tour_id (PK)</code><br />
              🔗 <code style={{ color: '#38bdf8' }}>destination_id (FK ➔ destinations)</code><br />
              • title, category, duration_days<br />
              • price_per_person, difficulty, rating
            </div>
          </div>

          {/* Entity 4 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#fff' }}>4. itinerary_items</strong>
              <span className="badge badge-info">Child 1:N</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
              🔑 <code style={{ color: '#f59e0b' }}>itinerary_id (PK)</code><br />
              🔗 <code style={{ color: '#38bdf8' }}>tour_id (FK ➔ tours ON DELETE CASCADE)</code><br />
              • day_number, title, activities<br />
              • meals_included, accommodation
            </div>
          </div>

          {/* Entity 5 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#fff' }}>5. guides & tour_guides</strong>
              <span className="badge badge-warning">M:N Junction</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
              🔑 <code style={{ color: '#f59e0b' }}>guide_id (PK)</code><br />
              🔗 <code style={{ color: '#38bdf8' }}>tour_id (FK) + guide_id (FK) (Composite PK)</code><br />
              • languages, experience_years, rating<br />
              • is_lead flag
            </div>
          </div>

          {/* Entity 6 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#fff' }}>6. bookings & payments</strong>
              <span className="badge badge-success">Transactional</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
              🔑 <code style={{ color: '#f59e0b' }}>booking_id (PK)</code> | <code style={{ color: '#f59e0b' }}>payment_id (PK)</code><br />
              🔗 <code style={{ color: '#38bdf8' }}>user_id (FK) + tour_id (FK)</code><br />
              • travel_date, travelers_count, total_amount<br />
              • transaction_reference, payment_status
            </div>
          </div>
        </div>
      </div>

      {/* Relational Concepts & Normalization */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
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
            <ShieldCheck size={18} color="#10b981" />
            <span>Database Normalization (3NF & BCNF)</span>
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>1NF:</strong> All attributes contain atomic scalar values. Repeating groups (e.g. itinerary days) separated into `itinerary_items`.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>2NF:</strong> No partial dependency on candidate keys. Composite keys in `tour_guides` strictly determine relationship flags.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>3NF:</strong> No transitive dependencies. Destination details belong exclusively to `destinations` rather than repeating inside `tours`.</span>
            </li>
          </ul>
        </div>

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
            <Terminal size={18} color="#38bdf8" />
            <span>Running with MySQL / PostgreSQL</span>
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            The DDL scripts located in <code style={{ color: '#38bdf8' }}>backend/src/db/schema.sql</code> and <code style={{ color: '#38bdf8' }}>backend/src/db/seeds.sql</code> use standard ANSI SQL and can be imported directly into MySQL Workbench or pgAdmin:
          </p>
          <div style={{
            background: '#090d16',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.775rem',
            color: '#38bdf8'
          }}>
            # To import into MySQL CLI:<br />
            mysql -u root -p travel_db &lt; backend/src/db/schema.sql<br />
            mysql -u root -p travel_db &lt; backend/src/db/seeds.sql
          </div>
        </div>
      </div>
    </div>
  );
}
