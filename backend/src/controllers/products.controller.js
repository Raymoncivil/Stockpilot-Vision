const productsService = require('../services/products.service');

/**
 * GET /products
 * Soporta filtros opcionales (?search, ?category, ?is_active)
 */
exports.getProducts = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      is_active: req.query.is_active
    };

    const products = await productsService.getProducts(filters);
    res.json(products);
  } catch (error) {
    console.error('❌ Error getProducts:', error.message);
    res.status(500).json({
      message: 'Error al obtener productos'
    });
  }
};

/**
 * GET /products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productsService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('❌ Error getProductById:', error.message);
    res.status(500).json({
      message: 'Error al obtener producto'
    });
  }
};

/**
 * POST /products
 */
exports.createProduct = async (req, res) => {
  try {
    const product = await productsService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error createProduct:', error.message);

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'El SKU o código de barras ya existe'
      });
    }

    res.status(400).json({
      message: error.message
    });
  }
};

/**
 * PUT /products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productsService.updateProduct(id, req.body);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('❌ Error updateProduct:', error.message);
    res.status(400).json({
      message: error.message
    });
  }
};

/**
 * DELETE /products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productsService.deleteProduct(id);

    if (!result) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    res.json({
      message: 'Producto desactivado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error deleteProduct:', error.message);
    res.status(500).json({
      message: 'Error al eliminar producto'
    });
  }
};

/**
 * GET /products/:id/stock
 */
exports.getProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await productsService.getProductStock(id);
    res.json(stock);
  } catch (error) {
    console.error('❌ Error getProductStock:', error.message);
    res.status(500).json({
      message: 'Error al obtener stock del producto'
    });
  }
};

