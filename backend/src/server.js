const express = require('express');
const cors = require('cors');
require('dotenv').config();

// DB
const pool = require('./config/db');

// Rutas
const stockMovementsRoutes = require('./routes/stockMovements.routes');
const productsRoutes = require('./routes/products.routes');
const locationsRoutes = require('./routes/locations.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// ==============================
// Health check
// ==============================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StockPilot Backend',
    timestamp: new Date()
  });
});

// ==============================
// DB test
// ==============================
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      db: 'ok',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('❌ Error DB:', error.message);
    res.status(500).json({
      db: 'error',
      message: error.message
    });
  }
});

// ==============================
// API Routes (alineadas con frontend)
// ==============================
app.use('/api/products', productsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/movements', stockMovementsRoutes);


// ==============================
// Server
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor levantado en http://localhost:${PORT}`);
});
    