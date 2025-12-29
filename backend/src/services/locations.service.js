const pool = require('../config/db');

exports.getLocations = async (filters = {}) => {
  const { search, is_active } = filters;
  
  let query = `
    SELECT id, code, name, description, is_active, created_at, updated_at
    FROM locations
    WHERE 1=1
  `;
  
  const values = [];
  let index = 1;
  
  if (search) {
    query += ` AND (name ILIKE $${index} OR code ILIKE $${index})`;
    values.push(`%${search}%`);
    index++;
  }
  
  if (is_active !== undefined) {
    query += ` AND is_active = $${index}`;
    values.push(is_active === 'true' || is_active === true);
    index++;
  }
  
  query += ` ORDER BY code ASC`;
  
  const result = await pool.query(query, values);
  return result.rows;
};

exports.getLocationById = async (id) => {
  const query = `SELECT * FROM locations WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

exports.createLocation = async (data) => {
  const { code, name, description } = data;
  
  if (!code || !name) {
    throw new Error('Código y nombre son obligatorios');
  }
  
  const query = `
    INSERT INTO locations (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  
  const result = await pool.query(query, [code, name, description || null]);
  return result.rows[0];
};

exports.updateLocation = async (id, data) => {
  const { code, name, description, is_active } = data;
  
  const updates = [];
  const values = [];
  let index = 1;
  
  if (code !== undefined) {
    updates.push(`code = $${index++}`);
    values.push(code);
  }
  
  if (name !== undefined) {
    updates.push(`name = $${index++}`);
    values.push(name);
  }
  
  if (description !== undefined) {
    updates.push(`description = $${index++}`);
    values.push(description);
  }
  
  if (is_active !== undefined) {
    updates.push(`is_active = $${index++}`);
    values.push(is_active);
  }
  
  if (updates.length === 0) {
    throw new Error('No hay campos para actualizar');
  }
  
  values.push(id);
  
  const query = `
    UPDATE locations
    SET ${updates.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.deleteLocation = async (id) => {
  const query = `UPDATE locations SET is_active = false WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

exports.getLocationStock = async (id) => {
  const query = `
    SELECT 
      l.id AS location_id,
      l.name AS location_name,
      p.id AS product_id,
      p.name AS product_name,
      p.sku,
      COALESCE(sb.quantity, 0) AS stock
    FROM locations l
    LEFT JOIN stock_balances sb ON sb.location_id = l.id
    LEFT JOIN products p ON p.id = sb.product_id
    WHERE l.id = $1
    AND (sb.quantity IS NULL OR sb.quantity > 0)
    ORDER BY p.name
  `;
  
  const result = await pool.query(query, [id]);
  
  const totalStock = result.rows.reduce((sum, row) => {
    return sum + parseFloat(row.stock || 0);
  }, 0);
  
  return {
    location_id: id,
    total_items: result.rows.length,
    total_stock: totalStock,
    products: result.rows
  };
};