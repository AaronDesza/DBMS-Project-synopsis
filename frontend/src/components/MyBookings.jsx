import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, MapPin, DollarSign, Ban, CheckCircle, RefreshCw } from 'lucide-react';

export default function MyBookings({ onRefreshTrigger }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [onRefreshTrigger]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will update the database state and process a refund.')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
            Reservation Management Dashboard
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Records linked across <code style={{ color: '#38bdf8' }}>bookings</code>, <code style={{ color: '#38bdf8' }}>users</code>, <code style={{ color: '#38bdf8' }}>tours</code>, and <code style={{ color: '#38bdf8' }}>destinations</code>.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchBookings}>
          <RefreshCw size={16} />
          <span>Refresh Records</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Loading relational booking records...
        </div>
      ) : error ? (
        <div className="badge badge-danger" style={{ padding: '1rem' }}>
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-subtle)'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No bookings found</h3>
          <p style={{ color: '#94a3b8' }}>Explore the tours catalog and book your first expedition!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map(b => {
            const isCancelled = b.booking_status === 'Cancelled';
            return (
              <div
                key={b.booking_id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  opacity: isCancelled ? 0.65 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                      padding: '0.6rem 0.9rem',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: '#38bdf8',
                      fontSize: '0.9rem'
                    }}>
                      {b.booking_reference}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                        {b.tour_title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span>📍 {b.destination_name}, {b.destination_country}</span>
                        <span>•</span>
                        <span>🏷️ {b.tour_category}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge ${isCancelled ? 'badge-danger' : b.booking_status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      Status: {b.booking_status}
                    </span>
                    <span className={`badge ${b.payment_status === 'Paid' ? 'badge-success' : b.payment_status === 'Refunded' ? 'badge-danger' : 'badge-warning'}`}>
                      Payment: {b.payment_status}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  background: 'var(--bg-surface)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Traveler Name</div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{b.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.customer_email}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Departure Date</div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{b.travel_date}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.duration_days} Days Trip</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Travelers Count</div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{b.travelers_count} Person(s)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>${b.unit_price} / each</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Amount Paid</div>
                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.2rem' }}>
                      ${b.total_amount?.toLocaleString()} USD
                    </div>
                  </div>
                </div>

                {b.special_requests && (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Note: "{b.special_requests}"
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Booked at: {b.booking_date}
                  </span>

                  {!isCancelled && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancelBooking(b.booking_id)}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <Ban size={14} />
                      <span>Cancel & Refund</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
