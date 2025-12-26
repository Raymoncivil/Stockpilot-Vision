const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Conexión a la base de datos
const pool = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StockPilot Backend',
    timestamp: new Date()
  });
});

// Prueba de conexión a PostgreSQL
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      db: 'ok',
      time: result.rows[0].now
    });
  } catch (error) {
    console.error('❌ Error en DB test:', error);
    res.status(500).json({
      db: 'error',
      message: error.message
    });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;

// Levantar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor levantado en http://localhost:${PORT}`);
});
