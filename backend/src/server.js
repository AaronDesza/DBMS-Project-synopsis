import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import toursRoutes from './routes/toursRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';
import reviewsRoutes from './routes/reviewsRoutes.js';
import dbmsRoutes from './routes/dbmsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import placesRoutes from './routes/placesRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import initDatabase from './db/initDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/dbms', dbmsRoutes);

// Health check & Root endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Travel & Tour DBMS Backend API Server',
    health: '/api/health',
    endpoints: ['/api/places', '/api/tours', '/api/bookings', '/api/reviews', '/api/favorites', '/api/dbms/schema']
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    message: 'Travel & Tour DBMS API Root',
    health: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Travel & Tour DBMS Backend API'
  });
});


// Global Error Handler & Invalid JSON Middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload format' });
  }
  console.error('Server internal error:', err.message);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// 404 Route Catch-all
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found` });
});

// Auto-initialize DB on startup if needed and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✈️  Travel DBMS Backend running at http://localhost:${PORT}`);
    console.log(`📊 DBMS API endpoints:`);
    console.log(`   - GET  /api/tours`);
    console.log(`   - GET  /api/tours/destinations`);
    console.log(`   - GET  /api/bookings`);
    console.log(`   - GET  /api/places`);
    console.log(`   - GET  /api/places/:id`);
    console.log(`   - POST /api/places       (JWT required)`);
    console.log(`   - PUT  /api/places/:id   (JWT required)`);
    console.log(`   - DELETE /api/places/:id (JWT required)`);
    console.log(`   - POST /api/favorites    (JWT required)`);
    console.log(`   - GET  /api/favorites/:userId (JWT required)`);
    console.log(`   - GET  /api/dbms/schema`);
    console.log(`   - POST /api/dbms/query`);
    console.log(`   - GET  /api/dbms/analytics`);
    console.log(`======================================================\n`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
