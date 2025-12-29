const { AppError } = require('./errorHandler');

/**
 * Validador genérico de campos requeridos
 */
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      return next(new AppError(
        `Campos obligatorios faltantes: ${missingFields.join(', ')}`,
        400
      ));
    }
    
    next();
  };
};

/**
 * Validador para creación de productos
 */
const validateProductCreation = (req, res, next) => {
  const { sku, name } = req.body;
  
  if (!sku || !name) {
    return next(new AppError('SKU y nombre son obligatorios', 400));
  }
  
  if (sku.length < 3) {
    return next(new AppError('El SKU debe tener al menos 3 caracteres', 400));
  }
  
  if (name.length < 3) {
    return next(new AppError('El nombre debe tener al menos 3 caracteres', 400));
  }
  
  next();
};

/**
 * Validador para creación de ubicaciones
 */
const validateLocationCreation = (req, res, next) => {
  const { code, name } = req.body;
  
  if (!code || !name) {
    return next(new AppError('Código y nombre son obligatorios', 400));
  }
  
  if (code.length < 2) {
    return next(new AppError('El código debe tener al menos 2 caracteres', 400));
  }
  
  next();
};

/**
 * Validador para movimientos de stock
 */
const validateStockMovement = (req, res, next) => {
  const {
    product_id,
    movement_type,
    quantity,
    from_location_id,
    to_location_id
  } = req.body;
  
  // Validaciones básicas
  if (!product_id || !movement_type || !quantity) {
    return next(new AppError('product_id, movement_type y quantity son obligatorios', 400));
  }
  
  // Validar que quantity sea un número positivo
  if (isNaN(quantity) || quantity <= 0) {
    return next(new AppError('La cantidad debe ser un número mayor a cero', 400));
  }
  
  // Validar tipo de movimiento
  const validTypes = ['IN', 'OUT', 'MOVE', 'ADJUST', 'COUNT'];
  if (!validTypes.includes(movement_type)) {
    return next(new AppError(
      `Tipo de movimiento inválido. Debe ser: ${validTypes.join(', ')}`,
      400
    ));
  }
  
  // Validaciones específicas por tipo de movimiento
  if (movement_type === 'IN' && !to_location_id) {
    return next(new AppError('IN requiere to_location_id', 400));
  }
  
  if (movement_type === 'OUT' && !from_location_id) {
    return next(new AppError('OUT requiere from_location_id', 400));
  }
  
  if (movement_type === 'MOVE') {
    if (!from_location_id || !to_location_id) {
      return next(new AppError('MOVE requiere from_location_id y to_location_id', 400));
    }
    
    if (from_location_id === to_location_id) {
      return next(new AppError('from_location_id y to_location_id deben ser diferentes', 400));
    }
  }
  
  if (movement_type === 'ADJUST' && !to_location_id) {
    return next(new AppError('ADJUST requiere to_location_id', 400));
  }
  
  if (movement_type === 'COUNT' && !to_location_id) {
    return next(new AppError('COUNT requiere to_location_id', 400));
  }
  
  next();
};

/**
 * Validador de parámetros de ID
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return next(new AppError('ID inválido', 400));
  }
  
  next();
};

module.exports = {
  validateRequired,
  validateProductCreation,
  validateLocationCreation,
  validateStockMovement,
  validateId
};