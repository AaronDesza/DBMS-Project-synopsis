import React from 'react';
import { Compass, BookMarked, Database, BarChart3, Layers, Plane } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, bookingsCount }) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setActiveTab('explore')}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #0284c7, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
        }}>
          <Plane size={22} />
        </div>
        <div>
          <span>Wanderlust<span style={{ color: '#38bdf8' }}>DBMS</span></span>
        </div>
        <span className="nav-brand-badge">Relational Tour System</span>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          <Compass size={16} />
          <span>Explore Tours</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <BookMarked size={16} />
          <span>My Bookings</span>
          {bookingsCount > 0 && (
            <span className="nav-badge-count">{bookingsCount}</span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === 'dbms' ? 'active' : ''}`}
          onClick={() => setActiveTab('dbms')}
        >
          <Database size={16} />
          <span>DBMS Relational Explorer</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          <span>Analytics</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          <Layers size={16} />
          <span>ER & Docs</span>
        </button>
      </nav>
    </header>
  );
}
