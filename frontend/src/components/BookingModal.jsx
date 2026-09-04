import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { createBooking } from '../services/api';

export default function BookingModal({ tour, onClose, onBookingSuccess }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [fullName, setFullName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [phone, setPhone] = useState('+1-555-0192');
  const [travelDate, setTravelDate] = useState('2026-10-15');
  const [travelersCount, setTravelersCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState('');

  if (!tour) return null;

  const totalAmount = (tour.price_per_person || 0) * travelersCount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await createBooking({
        userId: 1,
        fullName,
        email,
        phone,
        tourId: tour.tour_id,
        travelDate,
        travelersCount: Number(travelersCount),
        specialRequests,
        paymentMethod
      });

      if (data.success) {
        setConfirmedBooking(data.data);
        if (onBookingSuccess) onBookingSuccess(data.data);
      } else {
        setError(data.message || data.error || 'Failed to complete booking');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {confirmedBooking ? '🎉 Reservation Confirmed!' : 'Book Tour Package'}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {confirmedBooking ? (
            <div style={{ textAlign: 'center', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <CheckCircle2 size={40} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  Booking Successful!
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  A relational transaction was committed into <code style={{ color: '#38bdf8' }}>bookings</code> and <code style={{ color: '#38bdf8' }}>payments</code> tables.
                </p>
              </div>

              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Reference:</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>{confirmedBooking.booking_reference}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Package:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{confirmedBooking.tour_title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Travel Date:</span>
                  <span style={{ color: '#fff' }}>{confirmedBooking.travel_date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Travelers:</span>
                  <span style={{ color: '#fff' }}>{confirmedBooking.travelers_count} Person(s)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ color: '#94a3b8' }}>Total Paid:</span>
                  <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>${confirmedBooking.total_amount?.toLocaleString()} USD</span>
                </div>
              </div>

              <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
                Done & View in My Bookings
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Tour Brief */}
              <div style={{
                background: 'var(--bg-surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>SELECTED EXPEDITION</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{tour.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{tour.destination_name}, {tour.destination_country} • {tour.duration_days} Days</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    ${tour.price_per_person}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>per traveler</div>
                </div>
              </div>

              {error && (
                <div className="badge badge-danger" style={{ padding: '0.75rem' }}>
                  {error}
                </div>
              )}

              {/* Form inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1-555-0192"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Departure Date</label>
                  <input
                    type="date"
                    className="form-input"
                    min={todayStr}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Travelers Count</label>
                  <input
                    type="number"
                    min={1}
                    max={tour.max_group_size || 20}
                    className="form-input"
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(Math.max(1, Number(e.target.value)))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method (DBMS Transaction Simulated)</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Credit Card">💳 Credit Card (Instant Confirmation)</option>
                  <option value="UPI / NetBanking">⚡ UPI / NetBanking</option>
                  <option value="PayPal">🅿️ PayPal</option>
                  <option value="Crypto">🪙 Crypto Wallet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Dietary preferences, airport transfer time, room preference..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              {/* Price Calculation Card */}
              <div style={{
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Calculated Total: ${tour.price_per_person} × {travelersCount} traveler(s)
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                    ${totalAmount.toLocaleString()} USD
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.8rem' }}>
                  <ShieldCheck size={16} />
                  <span>ACID Transaction Safe</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '0.85rem', fontSize: '1rem' }}
              >
                {loading ? 'Processing Database Transaction...' : `Confirm & Pay $${totalAmount.toLocaleString()}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
