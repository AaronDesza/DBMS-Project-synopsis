const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const publicPath = path.join(process.cwd(), 'public');

// Core Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(publicPath));

// MongoDB URI with IPv4 fallback for local environments
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travel_booking_db';

let isConnected = false;
async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('MongoDB Connected Successfully to travel_booking_db');
  } catch (err) {
    console.error('MongoDB Connection Warning:', err.message);
  }
}

// Initial connection
connectDB();

// Middleware to ensure connection before handling API routes
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// Fallback to SPA for frontend navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Only listen locally, export for Vercel serverless execution
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;