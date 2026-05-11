const productsService = require('../services/productsService');
const { normalizeId } = require('../utils/idValidator');
const productModel = require('../models/productModel');

/**
 * Controlador de Productos
 * Toda la lógica de lectura y filtrado está delegada al servicio
 * El controlador solo coordina la presentación
 */

/**
 * Muestra la lista de todos los productos con sugerencias
 */
exports.showProductList = (req, res) => {
  const productos = productsService.getAllProducts();
  const productosSugeridos = productsService.getSuggestedProducts(5);
  
  res.render('pages/index', { productos, productosSugeridos });
};

/**
 * Muestra el detalle de un producto específico
 * Valida que el ID sea numérico y exista
 * - ID no numérico → 400
 * - ID inexistente → 404
 */
exports.showProductDetail = (req, res) => {
  const rawId = req.params.id;
  
  // Normalizar y validar ID
  const validation = normalizeId(rawId, {
    checkExists: (id) => productModel.getById(id) !== undefined
  });
  
  // Si validación falla, mostrar error apropiado
  if (!validation.valid) {
    return res.status(validation.statusCode).render('404', { 
      title: validation.error, 
      url: req.originalUrl 
    });
  }
  
  // ID válido, obtener producto
  const producto = productsService.getProductById(validation.id);

  const productosRelacionados = productsService.getRelatedProducts(producto, 4);
  
  res.render('pages/product', { producto, productosRelacionados });
};
