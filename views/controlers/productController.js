const productModel = require('../models/productModel');

exports.showProductList = (req, res) => {
  const productos = productModel.getAll();
  const productosSugeridos = productos.slice(0, 5);
  res.render('pages/index', { productos, productosSugeridos });
};

exports.showProductDetail = (req, res) => {
  const productId = req.params.id;
  const producto = productModel.getById(productId);

  if (!producto) {
    return res.status(404).render('404', { title: 'Producto no encontrado', url: req.originalUrl });
  }

  const productosRelacionados = productModel.getRelated(producto, 4);
  res.render('pages/product', { producto, productosRelacionados });
};