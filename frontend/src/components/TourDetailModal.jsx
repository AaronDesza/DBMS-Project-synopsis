import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Users, MapPin, Calendar, CheckCircle2, MessageSquare, UserCheck } from 'lucide-react';

export default function TourDetailModal({ tourId, onClose, onOpenBook, onReviewSubmitted }) {
  const [tourDetails, setTourDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchTourData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/tours/${tourId}`);
      const data = await res.json();
      if (data.success) {
        setTourDetails(data.data);
      } else {
        setError(data.message || 'Failed to fetch tour details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tourId) {
      fetchTourData();
    }
  }, [tourId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          userId: 1, // Alex Rivera
          rating: Number(rating),
          title: reviewTitle || 'Traveler Experience',
          comment
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess('Review submitted & database trigger/ratings updated!');
        setComment('');
        setReviewTitle('');
        fetchTourData(); // reload reviews & updated rating
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err) {
      alert('Error submitting review: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!tourId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Tour Package Details</div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Loading comprehensive tour itinerary & guide details...
            </div>
          ) : error ? (
            <div className="badge badge-danger" style={{ padding: '1rem' }}>
              {error}
            </div>
          ) : tourDetails ? (
            <>
              {/* Tour Header Banner */}
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                height: 260
              }}>
                <img
                  src={tourDetails.image_url}
                  alt={tourDetails.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(11,15,25,0.95), transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1.5rem'
                }}>
                  <div>
                    <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                      {tourDetails.category}
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                      {tourDetails.title}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} color="#38bdf8" />
                        {tourDetails.destination_name}, {tourDetails.destination_country}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} color="#38bdf8" />
                        {tourDetails.duration_days} Days / {tourDetails.duration_days - 1} Nights
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        {Number(tourDetails.rating).toFixed(2)} ({tourDetails.total_reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Ribbon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>All-Inclusive Price</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                    ${tourDetails.price_per_person.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ person</span>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onOpenBook(tourDetails);
                  }}
                  style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}
                >
                  Book This Expedition
                </button>
              </div>

              {/* Overview & Relational Details */}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Experience Overview</h4>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {tourDetails.overview}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Difficulty Level</div>
                    <div style={{ fontWeight: 600, color: '#38bdf8' }}>{tourDetails.difficulty}</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Best Time to Visit</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{tourDetails.best_time_to_visit || 'Year-round'}</div>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Climate & Environment</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{tourDetails.climate || 'Temperate'}</div>
                  </div>
                </div>
              </div>

              {/* Day-by-day Itinerary */}
              {tourDetails.itinerary && tourDetails.itinerary.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="#38bdf8" />
                    <span>Daily Itinerary Schedule (Relational Join: `itinerary_items`)</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tourDetails.itinerary.map(item => (
                      <div
                        key={item.itinerary_id}
                        style={{
                          padding: '1rem',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: '4px solid #0284c7'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem' }}>
                            Day {item.day_number}: {item.title}
                          </span>
                          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                            Meals: {item.meals_included}
                          </span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {item.activities}
                        </p>
                        {item.accommodation && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                            🏨 Stay: {item.accommodation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Tour Guides */}
              {tourDetails.guides && tourDetails.guides.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCheck size={18} color="#a855f7" />
                    <span>Assigned Expert Guides (Junction Table: `tour_guides`)</span>
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {tourDetails.guides.map(g => (
                      <div
                        key={g.guide_id}
                        style={{
                          display: 'flex',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-md)',
                          alignItems: 'center'
                        }}
                      >
                        <img
                          src={g.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={g.name}
                          style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                            {g.name} {g.is_lead === 1 && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Lead Guide</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            🌐 {g.languages}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Star size={12} fill="#f59e0b" /> {Number(g.rating).toFixed(2)} ({g.experience_years} yrs exp)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews & Submit Form */}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} color="#10b981" />
                  <span>Traveler Feedback & Ratings (Table: `reviews`)</span>
                </h4>

                {/* Submit review */}
                <form onSubmit={handleReviewSubmit} style={{
                  background: 'var(--bg-surface)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#38bdf8' }}>
                    Leave a Review for this Tour
                  </div>
                  {reviewSuccess && (
                    <div className="badge badge-success" style={{ padding: '0.5rem' }}>
                      {reviewSuccess}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Rating:</span>
                      <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="form-select"
                        style={{ padding: '0.35rem 0.75rem' }}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        <option value={2}>⭐⭐ (2 - Below Average)</option>
                        <option value={1}>⭐ (1 - Poor)</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Review Headline (e.g. Magnificent trip!)"
                      className="form-input"
                      style={{ flex: 1 }}
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Write your traveler feedback..."
                    className="form-textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </div>
                </form>

                {/* List Reviews */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {tourDetails.reviews && tourDetails.reviews.length > 0 ? (
                    tourDetails.reviews.map(rev => (
                      <div
                        key={rev.review_id}
                        style={{
                          padding: '0.875rem',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                            {rev.reviewer_name || 'Traveler'}
                          </span>
                          <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </span>
                        </div>
                        {rev.title && (
                          <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                            "{rev.title}"
                          </div>
                        )}
                        <p style={{ color: '#94a3b8', fontSize: '0.825rem' }}>
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No reviews yet. Be the first to review!</div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
