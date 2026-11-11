const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app        = express();
const publicPath = path.join(process.cwd(), 'public');

// Core Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(publicPath));

// Health check – runs SELECT 1 against Neon to verify connectivity
app.get('/api/health', async (req, res) => {
  let dbConnected = false;
  try {
    const pool = require('./backend/db/pool');
    await pool.query('SELECT 1');
    dbConnected = true;
  } catch (_) {}
  res.json({ status: 'Server is running', timestamp: new Date().toISOString(), dbConnected });
});

// API Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/packages',     require('./routes/packages'));
app.use('/api/hotels',       require('./routes/hotels'));
app.use('/api/transport',    require('./routes/transport'));
app.use('/api/bookings',     require('./routes/bookings'));
app.use('/api/payments',     require('./routes/payments'));
app.use('/api/reviews',      require('./routes/reviews'));
app.use('/api/admin',        require('./routes/admin'));

// Fallback to SPA for frontend navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Only listen locally; export app for Vercel serverless
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

module.exports = app;
