const pool = require('../config/db');

/**
 * Obtener todos los productos con filtros opcionales
 * @param {Object} filters { search, category, is_active }
 */
exports.getProducts = async (filters = {}) => {
  const { search, category, is_active } = filters;

  let query = `
    SELECT
      id,
      sku,
      name,
      barcode,
      category,
      unit,
      is_active,
      created_at,
      updated_at
    FROM products
    WHERE 1=1
  `;

  const values = [];
  let index = 1;

  // Búsqueda general
  if (search) {
    query += `
      AND (
        name ILIKE $${index}
        OR sku ILIKE $${index}
        OR barcode ILIKE $${index}
      )
    `;
    values.push(`%${search}%`);
    index++;
  }

  // Filtro por categoría
  if (category) {
    query += ` AND category = $${index}`;
    values.push(category);
    index++;
  }

  // Filtro activo/inactivo
  if (is_active !== undefined) {
    query += ` AND is_active = $${index}`;
    values.push(is_active === true || is_active === 'true');
    index++;
  }

  query += ` ORDER BY name ASC`;

  const { rows } = await pool.query(query, values);
  return rows;
};

/**
 * Obtener producto por ID
 */
exports.getProductById = async (id) => {
  const query = `
    SELECT
      id,
      sku,
      name,
      barcode,
      category,
      unit,
      is_active,
      created_at,
      updated_at
    FROM products
    WHERE id = $1
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

/**
 * Crear producto
 */
exports.createProduct = async (data) => {
  const {
    sku,
    name,
    barcode = null,
    category = null,
    unit = 'unit'
  } = data;

  if (!sku || !name) {
    throw new Error('SKU y nombre son obligatorios');
  }

  const query = `
    INSERT INTO products (sku, name, barcode, category, unit)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    sku,
    name,
    barcode,
    category,
    unit
  ]);

  return rows[0];
};

/**
 * Actualizar producto
 */
exports.updateProduct = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  values.push(id);

  const query = `
    UPDATE products
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

/**
 * Eliminación lógica (soft delete)
 */
exports.deleteProduct = async (id) => {
  const query = `
    UPDATE products
    SET is_active = false
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

/**
 * Obtener stock por ubicación
 */
exports.getProductStock = async (id) => {
  const query = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      p.sku,
      l.id AS location_id,
      l.name AS location_name,
      l.code AS location_code,
      COALESCE(sb.quantity, 0) AS stock
    FROM products p
    LEFT JOIN stock_balances sb ON sb.product_id = p.id
    LEFT JOIN locations l ON l.id = sb.location_id
    WHERE p.id = $1
    ORDER BY l.name
  `;

  const { rows } = await pool.query(query, [id]);

  const total_stock = rows.reduce(
    (sum, r) => sum + Number(r.stock || 0),
    0
  );

  return {
    product_id: id,
    total_stock,
    locations: rows
  };
};
