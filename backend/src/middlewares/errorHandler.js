/**
 * Clase personalizada para errores de aplicación
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejar errores 404
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Ruta no encontrada - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Middleware centralizado para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log del error para debugging
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    statusCode: error.statusCode
  });

  // Error de PostgreSQL - Foreign Key
  if (err.code === '23503') {
    error.message = 'Referencia inválida: el registro relacionado no existe';
    error.statusCode = 400;
  }

  // Error de PostgreSQL - Unique Violation
  if (err.code === '23505') {
    error.message = 'Ya existe un registro con esos datos únicos';
    error.statusCode = 409;
  }

  // Error de PostgreSQL - Not Null Violation
  if (err.code === '23502') {
    error.message = 'Campos obligatorios faltantes';
    error.statusCode = 400;
  }

  // Error de PostgreSQL - Check Violation
  if (err.code === '23514') {
    error.message = 'Los datos no cumplen con las restricciones definidas';
    error.statusCode = 400;
  }

  // Error personalizado desde triggers (stock insuficiente)
  if (err.code === 'P0001') {
    error.message = err.message;
    error.statusCode = 400;
  }

  // Error de validación personalizado
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
  }

  // Error de casting (ID inválido)
  if (err.name === 'CastError') {
    error.message = 'ID inválido';
    error.statusCode = 400;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  AppError,
  notFound,
  errorHandler
};