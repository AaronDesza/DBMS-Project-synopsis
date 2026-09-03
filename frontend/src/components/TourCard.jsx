import React from 'react';
import { Star, Clock, Users, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TourCard({ tour, onSelectTour, onQuickBook }) {
  return (
    <div className="tour-card">
      <div className="tour-image-wrap">
        <img 
          src={tour.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'} 
          alt={tour.title}
          className="tour-image"
          loading="lazy"
        />
        {tour.is_featured === 1 && (
          <span className="tour-badge-featured">Featured Choice</span>
        )}
        <span className="tour-badge-category">{tour.category}</span>
      </div>

      <div className="tour-content">
        <div className="tour-location">
          <MapPin size={14} />
          <span>{tour.destination_name}, {tour.destination_country}</span>
        </div>

        <h3 className="tour-title">{tour.title}</h3>
        <p className="tour-overview">{tour.overview}</p>

        <div className="tour-meta-row">
          <div className="tour-meta-item">
            <Clock size={14} color="#38bdf8" />
            <span>{tour.duration_days} Days</span>
          </div>

          <div className="tour-meta-item">
            <Users size={14} color="#a855f7" />
            <span>Max {tour.max_group_size}</span>
          </div>

          <div className="tour-meta-item">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>
              {Number(tour.rating).toFixed(1)}
            </span>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
              ({tour.total_reviews})
            </span>
          </div>
        </div>

        <div className="tour-footer-row">
          <div className="tour-price-box">
            <span className="tour-price-label">Price / Traveler</span>
            <div className="tour-price-value">
              ${tour.price_per_person.toLocaleString()} <span>USD</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => onSelectTour(tour.tour_id)}
              style={{ padding: '0.5rem 0.85rem' }}
              title="View Itinerary, Guides & Reviews"
            >
              Details
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onQuickBook(tour)}
              style={{ padding: '0.5rem 0.95rem' }}
            >
              <span>Book</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
