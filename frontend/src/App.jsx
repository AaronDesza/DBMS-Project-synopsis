import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import TourCard from './components/TourCard';
import TourDetailModal from './components/TourDetailModal';
import BookingModal from './components/BookingModal';
import MyBookings from './components/MyBookings';
import DbmsExplorer from './components/DbmsExplorer';
import AnalyticsView from './components/AnalyticsView';
import ArchitectureView from './components/ArchitectureView';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [tours, setTours] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDestination, setSelectedDestination] = useState('');

  // Modals
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [bookingTour, setBookingTour] = useState(null);

  // Bookings count & refresh trigger
  const [bookingsCount, setBookingsCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch Destinations
  useEffect(() => {
    fetch('http://localhost:5000/api/tours/destinations')
      .then(r => r.json())
      .then(d => {
        if (d.success) setDestinations(d.data);
      })
      .catch(err => console.error('Failed to load destinations:', err));
  }, []);

  // Fetch Bookings Count
  useEffect(() => {
    fetch('http://localhost:5000/api/bookings')
      .then(r => r.json())
      .then(d => {
        if (d.success) setBookingsCount(d.count || 0);
      })
      .catch(err => console.error('Failed to load bookings count:', err));
  }, [refreshTrigger]);

  // Fetch Tours with filters
  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedDifficulty && selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
      if (selectedDestination) params.append('destinationId', selectedDestination);

      const res = await fetch(`http://localhost:5000/api/tours?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTours(data.data);
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
    fetchTours();
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDestination, refreshTrigger]);

  const handleBookingSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Background ambient lighting */}
      <div className="bg-glow-container">
        <div className="glow-orb-1" />
        <div className="glow-orb-2" />
      </div>

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingsCount={bookingsCount}
      />

      {/* Tab Contents */}
      <main className="main-content">
        {activeTab === 'explore' && (
          <>
            <HeroBanner
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              destinations={destinations}
              selectedDestination={selectedDestination}
              setSelectedDestination={setSelectedDestination}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  Available Tour Expeditions ({tours.length})
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Query dynamically filtered via SQL WHERE clauses
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                  Loading curated tours from SQLite DBMS...
                </div>
              ) : error ? (
                <div className="badge badge-danger" style={{ padding: '1rem', width: '100%', justifyContent: 'center' }}>
                  ⚠️ Backend Connection Notice: Make sure the backend server is running at localhost:5000 ({error})
                </div>
              ) : tours.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border-subtle)'
                }}>
                  <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No matching tours found</h3>
                  <p style={{ color: '#94a3b8' }}>Try adjusting your search criteria or category filter.</p>
                </div>
              ) : (
                <div className="tours-grid">
                  {tours.map(tour => (
                    <TourCard
                      key={tour.tour_id}
                      tour={tour}
                      onSelectTour={(id) => setSelectedTourId(id)}
                      onQuickBook={(t) => setBookingTour(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <MyBookings onRefreshTrigger={refreshTrigger} />
        )}

        {activeTab === 'dbms' && (
          <DbmsExplorer />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Tour Details Modal */}
      {selectedTourId && (
        <TourDetailModal
          tourId={selectedTourId}
          onClose={() => setSelectedTourId(null)}
          onOpenBook={(t) => setBookingTour(t)}
          onReviewSubmitted={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      {/* Booking Form Modal */}
      {bookingTour && (
        <BookingModal
          tour={bookingTour}
          onClose={() => setBookingTour(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Footer */}
      <footer style={{
        marginTop: '4rem',
        padding: '2rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(11, 15, 25, 0.9)',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        <div>
          <strong style={{ color: '#94a3b8' }}>Wanderlust Tour Management DBMS Project</strong> — Built with Node.js, Express, SQLite / SQL Relational Schema & React.
        </div>
      </footer>
    </div>
  );
}
