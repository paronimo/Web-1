/**
 * Validador de IDs
 * Normaliza y valida IDs de productos
 */

/**
 * Normaliza un ID y lo valida
 * @param {string|number} id - ID a normalizar
 * @param {Object} options - Opciones
 * @param {Function} options.checkExists - Función para verificar si existe (opcional)
 * @returns {Object} { valid: boolean, id: number|null, error: string|null, statusCode: number }
 * 
 * Estados de retorno:
 * - valid: true, id: number, statusCode: 200 → ID válido y existe
 * - valid: false, statusCode: 400 → ID no es numérico
 * - valid: false, statusCode: 404 → ID es numérico pero no existe
 */
function normalizeId(id, options = {}) {
  // Validar que el ID no esté vacío
  if (id === null || id === undefined || id === '') {
    return {
      valid: false,
      id: null,
      error: 'ID es requerido',
      statusCode: 400
    };
  }

  // Convertir a string para validar
  const idStr = String(id).trim();

  // Validar que sea un número entero positivo
  if (!Number.isInteger(Number(idStr)) || Number(idStr) <= 0) {
    return {
      valid: false,
      id: null,
      error: 'ID debe ser un número entero positivo',
      statusCode: 400
    };
  }

  // Convertir a número
  const normalizedId = Number(idStr);

  // Si se proporciona función de validación, verificar existencia
  if (options.checkExists && typeof options.checkExists === 'function') {
    const exists = options.checkExists(normalizedId);
    
    if (!exists) {
      return {
        valid: false,
        id: normalizedId,
        error: 'Producto no encontrado',
        statusCode: 404
      };
    }
  }

  // ID válido
  return {
    valid: true,
    id: normalizedId,
    error: null,
    statusCode: 200
  };
}

/**
 * Middleware para validar IDs en rutas
 * @param {string} paramName - Nombre del parámetro (default: 'id')
 * @param {Function} checkExists - Función para verificar existencia
 * @returns {Function} Middleware de Express
 */
function validateIdMiddleware(checkExists, paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    const validation = normalizeId(id, { checkExists });
    
    if (!validation.valid) {
      return res.status(validation.statusCode).render('404', {
        title: validation.error,
        url: req.originalUrl
      });
    }
    
    // Guardar el ID normalizado en req.params
    req.params[paramName] = validation.id;
    
    next();
  };
}

module.exports = {
  normalizeId,
  validateIdMiddleware
};
