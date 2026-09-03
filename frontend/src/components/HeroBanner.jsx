import React from 'react';
import { Search, Sparkles, SlidersHorizontal, MapPin } from 'lucide-react';

const CATEGORIES = ['All', 'Adventure', 'Cultural', 'Relaxation', 'Wildlife', 'Eco-Tourism'];
const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Challenging'];

export default function HeroBanner({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  destinations,
  selectedDestination,
  setSelectedDestination
}) {
  return (
    <section className="hero-section">
      <div className="hero-tag">
        <Sparkles size={14} />
        <span>Enterprise Relational Travel Management Database</span>
      </div>

      <h1 className="hero-title">
        Discover Extraordinary Destinations <span>Globally</span>
      </h1>
      
      <p className="hero-subtitle">
        Powered by an ACID-compliant Relational DBMS with normalized schemas, foreign-key integrity, indexed lookups, and transaction-safe bookings.
      </p>

      {/* Filter / Search Card */}
      <div className="filter-card">
        <div className="filter-grid">
          <div className="filter-input-group">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search tours, destinations, landmarks..."
              className="filter-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-input-group">
            <MapPin size={18} />
            <select
              className="filter-select"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
            >
              <option value="">All Destinations</option>
              {destinations.map(d => (
                <option key={d.destination_id} value={d.destination_id}>
                  {d.name} ({d.country})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-input-group">
            <SlidersHorizontal size={18} />
            <select
              className="filter-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map(diff => (
                <option key={diff} value={diff}>
                  Difficulty: {diff}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setSelectedDestination('');
            }}
          >
            Reset Filters
          </button>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
