import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import toursRoutes from './routes/toursRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';
import reviewsRoutes from './routes/reviewsRoutes.js';
import dbmsRoutes from './routes/dbmsRoutes.js';
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
app.use('/api/tours', toursRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/dbms', dbmsRoutes);

// Health check endpoint
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
    console.log(`   - GET  /api/dbms/schema`);
    console.log(`   - POST /api/dbms/query`);
    console.log(`   - GET  /api/dbms/analytics`);
    console.log(`======================================================\n`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
