const pool = require('../config/db');

/**
 * Crear un movimiento de stock
 * @param {Object} data
 */
exports.createStockMovement = async (data) => {
  const {
    product_id,
    movement_type,
    quantity,
    from_location_id,
    to_location_id,
    reference
  } = data;

  // 1️⃣ Validaciones básicas
  if (!product_id || !movement_type || !quantity) {
    throw new Error('Campos obligatorios faltantes');
  }

  if (quantity <= 0) {
    throw new Error('La cantidad debe ser mayor a cero');
  }

  // 2️⃣ Validaciones por tipo de movimiento
  if (movement_type === 'IN' && !to_location_id) {
    throw new Error('IN requiere to_location_id');
  }

  if (movement_type === 'OUT' && !from_location_id) {
    throw new Error('OUT requiere from_location_id');
  }

  if (
    movement_type === 'MOVE' &&
    (!from_location_id || !to_location_id)
  ) {
    throw new Error('MOVE requiere from_location_id y to_location_id');
  }

  // 3️⃣ Insertar movimiento (los triggers manejan el stock)
  const query = `
    INSERT INTO stock_movements
      (product_id, movement_type, quantity, from_location_id, to_location_id, reference)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      product_id,
      movement_type,
      quantity,
      from_location_id,
      to_location_id,
      reference
    ]);

    return result.rows[0];
  } catch (error) {
    // FK: producto o ubicación no existe
    if (error.code === '23503') {
      throw new Error('Producto o ubicación no existe');
    }

    // Trigger de stock insuficiente
    if (error.code === 'P0001') {
      throw new Error(error.message);
    }

    throw error;
  }
};

/**
 * Obtener movimientos de stock (con filtros opcionales)
 * @param {Object} filters
 */
exports.getStockMovements = async (filters = {}) => {
  const {
    product_id,
    movement_type,
    date_from,
    date_to
  } = filters;

  let query = `
    SELECT *
    FROM stock_movements
    WHERE 1=1
  `;

  const values = [];
  let index = 1;

  if (product_id) {
    query += ` AND product_id = $${index++}`;
    values.push(product_id);
  }

  if (movement_type) {
    query += ` AND movement_type = $${index++}`;
    values.push(movement_type);
  }

  if (date_from) {
    query += ` AND created_at >= $${index++}`;
    values.push(date_from);
  }

  if (date_to) {
    query += ` AND created_at <= $${index++}`;
    values.push(date_to);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

