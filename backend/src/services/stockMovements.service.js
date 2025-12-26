const pool = require('../config/db');

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

  // 2️⃣ Validación por tipo de movimiento
  if (movement_type === 'IN' && !to_location_id) {
    throw new Error('IN requiere to_location_id');
  }

  if (movement_type === 'OUT' && !from_location_id) {
    throw new Error('OUT requiere from_location_id');
  }

  if (movement_type === 'MOVE' && (!from_location_id || !to_location_id)) {
    throw new Error('MOVE requiere from_location_id y to_location_id');
  }

  // 3️⃣ INSERT (la DB hace el resto)
  const query = `
    INSERT INTO stock_movements
    (product_id, movement_type, quantity, from_location_id, to_location_id, reference)
    VALUES ($1, $2, $3, $4, $5, $6)
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
    // Errores comunes de PostgreSQL
    if (error.code === '23503') {
      throw new Error('Producto o ubicación no existe');
    }

    if (error.code === 'P0001') {
      throw new Error(error.message); // trigger (stock insuficiente)
    }

    throw error;
  }
};
