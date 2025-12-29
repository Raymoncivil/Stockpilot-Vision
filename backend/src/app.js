const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Conexión a la base de datos
const pool = require('./config/db');

// Middlewares de error
const { notFound, errorHandler } = require('./middlewares/errorHandler');

// 🔹 IMPORTAR RUTAS
const stockMovementsRoutes = require('./routes/stockMovements.routes');
const stockRoutes = require('./routes/stock.routes');
const productsRoutes = require('./routes/products.routes');
const locationsRoutes = require('./routes/locations.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Middleware para logging (IMPORTANTE PARA DEBUG)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

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

// 🔴 MONTAR RUTAS (ORDEN IMPORTA)
app.use('/stock-movements', stockMovementsRoutes);
app.use('/stock', stockRoutes);
app.use('/products', productsRoutes);
app.use('/locations', locationsRoutes);

// Debug: Mostrar todas las rutas registradas
console.log('🛣️  Rutas registradas:');
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`   ${Object.keys(r.route.methods)} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`   ${Object.keys(handler.route.methods)} ${handler.route.path}`);
      }
    });
  }
});

// 🔴 MIDDLEWARES DE ERROR (deben ir AL FINAL)
app.use(notFound);
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;

// Levantar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor levantado en http://localhost:${PORT}`);
  console.log(`📚 Endpoints disponibles:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /db-test`);
  console.log(`   - *    /products`);
  console.log(`   - *    /locations`);
  console.log(`   - *    /stock`);
  console.log(`   - *    /stock-movements`);
});