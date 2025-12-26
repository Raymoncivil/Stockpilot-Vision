const express = require('express');
const router = express.Router();

const stockMovementsController = require('../controllers/stockMovements.controller');

// Crear movimiento de stock
router.post('/', stockMovementsController.createStockMovement);

module.exports = router;
