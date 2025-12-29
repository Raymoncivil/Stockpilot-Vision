const express = require('express');
const router = express.Router();   // ← ESTO ES LO QUE FALTA O ESTÁ MAL

const productsController = require('../controllers/products.controller');
const {
  validateProductCreation,
  validateId
} = require('../middlewares/validation.middleware');

// GET /products
router.get('/', productsController.getProducts);

// GET /products/:id
router.get('/:id', validateId, productsController.getProductById);

// POST /products/debug
router.post('/debug', (req, res) => {
  console.log('BODY RECIBIDO:', req.body);
  res.json(req.body);
});

// POST /products
router.post('/', validateProductCreation, productsController.createProduct);

// PUT /products/:id
router.put('/:id', validateId, productsController.updateProduct);

// DELETE /products/:id
router.delete('/:id', validateId, productsController.deleteProduct);

// GET /products/:id/stock
router.get('/:id/stock', validateId, productsController.getProductStock);

module.exports = router;
