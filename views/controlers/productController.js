const productsService = require('../services/productsService');
const { normalizeId } = require('../utils/idValidator');
const productModel = require('../models/productModel');

/**
 * Controlador de Productos
 * Toda la lógica de lectura y filtrado está delegada al servicio
 * El controlador solo coordina la presentación
 */

exports.showProductList = (req, res) => {
  const productos = productsService.getAllProducts();
  const productosSugeridos = productsService.getSuggestedProducts(5);
  
  res.render('pages/index', { productos, productosSugeridos });
};

exports.showProductDetail = (req, res) => {
  const rawId = req.params.id;
  const validation = normalizeId(rawId, {
    checkExists: (id) => productModel.getById(id) !== undefined
  });

  if (!validation.valid) {
    return res.status(validation.statusCode).render('404', {
      title: validation.error,
      url: req.originalUrl
    });
  }

  const producto = productsService.getProductById(validation.id);
  const productosRelacionados = productsService.getRelatedProducts(producto, 4);

  res.render('pages/product', { producto, productosRelacionados });
};
