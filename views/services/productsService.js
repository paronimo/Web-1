const productModel = require('../models/productModel');

/**
 * Servicio de Productos
 * Centraliza toda la lógica de lectura y filtrado de productos
 * Facilita migración a base de datos
 */

/**
 * Obtiene todos los productos
 * @returns {Array} Array con todos los productos
 */
function getAllProducts() {
  return productModel.getAll();
}

/**
 * Obtiene un producto por su ID
 * @param {string} id - ID del producto
 * @returns {Object|undefined} Producto encontrado o undefined
 */
function getProductById(id) {
  return productModel.getById(id);
}

/**
 * Obtiene productos sugeridos (primeros N productos)
 * @param {number} limit - Cantidad de productos a retornar
 * @returns {Array} Array de productos sugeridos
 */
function getSuggestedProducts(limit = 5) {
  const allProducts = getAllProducts();
  return allProducts.slice(0, limit);
}

/**
 * Obtiene productos relacionados a uno dado
 * (misma categoría)
 * @param {Object} product - Producto de referencia
 * @param {number} limit - Cantidad de productos relacionados
 * @returns {Array} Array de productos relacionados
 */
function getRelatedProducts(product, limit = 4) {
  return productModel.getRelated(product, limit);
}

/**
 * Obtiene productos por categoría
 * @param {string} category - Categoría a filtrar
 * @param {number} limit - Cantidad máxima de productos (opcional)
 * @returns {Array} Array de productos de la categoría
 */
function getProductsByCategory(category, limit = null) {
  const allProducts = getAllProducts();
  let filtered = allProducts.filter(product => 
    product.categoria.toLowerCase() === category.toLowerCase()
  );
  
  if (limit) {
    filtered = filtered.slice(0, limit);
  }
  
  return filtered;
}

/**
 * Filtra productos por rango de precio
 * @param {number} minPrice - Precio mínimo
 * @param {number} maxPrice - Precio máximo
 * @returns {Array} Array de productos dentro del rango de precio
 */
function getProductsByPriceRange(minPrice, maxPrice) {
  const allProducts = getAllProducts();
  return allProducts.filter(product => 
    product.precio >= minPrice && product.precio <= maxPrice
  );
}

/**
 * Obtiene productos en stock
 * @param {number} minStock - Stock mínimo requerido
 * @returns {Array} Array de productos con stock disponible
 */
function getProductsInStock(minStock = 1) {
  const allProducts = getAllProducts();
  return allProducts.filter(product => product.stock >= minStock);
}

/**
 * Busca productos por nombre o descripción
 * @param {string} query - Término de búsqueda
 * @returns {Array} Array de productos que coinciden
 */
function searchProducts(query) {
  const allProducts = getAllProducts();
  const searchTerm = query.toLowerCase().trim();
  
  return allProducts.filter(product => 
    product.nombre.toLowerCase().includes(searchTerm) ||
    product.descripcion.toLowerCase().includes(searchTerm)
  );
}

/**
 * Ordena productos por precio (ascendente o descendente)
 * @param {Array} products - Array de productos
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} Array ordenado
 */
function sortByPrice(products, order = 'asc') {
  const sorted = [...products];
  
  if (order.toLowerCase() === 'desc') {
    return sorted.sort((a, b) => b.precio - a.precio);
  }
  
  return sorted.sort((a, b) => a.precio - b.precio);
}

/**
 * Ordena productos por nombre
 * @param {Array} products - Array de productos
 * @returns {Array} Array ordenado alfabéticamente
 */
function sortByName(products) {
  const sorted = [...products];
  return sorted.sort((a, b) => 
    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  );
}

/**
 * Obtiene estadísticas de productos
 * @returns {Object} Objeto con estadísticas
 */
function getStatistics() {
  const allProducts = getAllProducts();
  
  return {
    total: allProducts.length,
    enStock: allProducts.filter(p => p.stock > 0).length,
    sinStock: allProducts.filter(p => p.stock === 0).length,
    precioPromedio: (allProducts.reduce((sum, p) => sum + p.precio, 0) / allProducts.length).toFixed(2),
    precioMinimo: Math.min(...allProducts.map(p => p.precio)),
    precioMaximo: Math.max(...allProducts.map(p => p.precio)),
    categorias: [...new Set(allProducts.map(p => p.categoria))],
    stockTotal: allProducts.reduce((sum, p) => sum + p.stock, 0)
  };
}

/**
 * Obtiene productos con múltiples filtros
 * @param {Object} filters - Objeto con filtros
 * @param {string} filters.category - Categoría (opcional)
 * @param {number} filters.minPrice - Precio mínimo (opcional)
 * @param {number} filters.maxPrice - Precio máximo (opcional)
 * @param {boolean} filters.inStock - Solo con stock (opcional)
 * @param {string} filters.sortBy - Campo para ordenar: 'precio' | 'nombre' (opcional)
 * @param {string} filters.sortOrder - Orden: 'asc' | 'desc' (opcional)
 * @returns {Array} Array de productos filtrados y ordenados
 */
function filterProducts(filters = {}) {
  let filtered = getAllProducts();
  
  // Filtrar por categoría
  if (filters.category) {
    filtered = filtered.filter(p => 
      p.categoria.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  // Filtrar por rango de precio
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.precio >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.precio <= filters.maxPrice);
  }
  
  // Filtrar solo productos en stock
  if (filters.inStock) {
    filtered = filtered.filter(p => p.stock > 0);
  }
  
  // Ordenar
  if (filters.sortBy) {
    if (filters.sortBy.toLowerCase() === 'precio') {
      filtered = sortByPrice(filtered, filters.sortOrder || 'asc');
    } else if (filters.sortBy.toLowerCase() === 'nombre') {
      filtered = sortByName(filtered);
    }
  }
  
  return filtered;
}

module.exports = {
  // Métodos básicos
  getAllProducts,
  getProductById,
  getSuggestedProducts,
  getRelatedProducts,
  
  // Métodos de filtrado
  getProductsByCategory,
  getProductsByPriceRange,
  getProductsInStock,
  searchProducts,
  filterProducts,
  
  // Métodos de ordenamiento
  sortByPrice,
  sortByName,
  
  // Métodos de utilidad
  getStatistics
};
