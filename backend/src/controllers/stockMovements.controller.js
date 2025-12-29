const stockMovementsService = require('../services/stockMovements.service');

exports.createStockMovement = async (req, res) => {
  try {
    const result = await stockMovementsService.createStockMovement(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error createStockMovement:', error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.getStockMovements = async (req, res) => {
  try {
    const movements = await stockMovementsService.getStockMovements(req.query);
    res.json(movements);
  } catch (error) {
    console.error('❌ Error getStockMovements:', error.message);
    res.status(500).json({
      message: 'Error al obtener movimientos de stock'
    });
  }
};


