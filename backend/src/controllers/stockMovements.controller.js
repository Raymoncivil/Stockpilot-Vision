const stockMovementsService = require('../services/stockMovements.service');

exports.createStockMovement = async (req, res) => {
  try {
    const result = await stockMovementsService.createStockMovement(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error createStockMovement:', error.message);

    res.status(400).json({
      message: error.message
    });
  }
};
