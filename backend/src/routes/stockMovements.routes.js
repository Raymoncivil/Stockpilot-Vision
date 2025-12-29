const express = require('express');
const router = express.Router();

const stockMovementsController = require('../controllers/stockMovements.controller');


// Crear movimiento de stock
// POST /stock-movements
router.post('/', stockMovementsController.createStockMovement);

// Listar movimientos de stock (con filtros opcionales)
// GET /stock-movements
router.get('/', stockMovementsController.getStockMovements);

module.exports = router;

