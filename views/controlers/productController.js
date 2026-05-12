const productModel = require('../models/productModel');

exports.showProductList = (req, res) => {
  let productos = productModel.getAll();
  const sort = req.query.sort;

  if (sort === 'asc') {
    productos = [...productos].sort((a, b) => a.precio - b.precio);
  } else if (sort === 'desc') {
    productos = [...productos].sort((a, b) => b.precio - a.precio);
  }

  const productosSugeridos = productos.slice(0, 5);
  res.render('pages/index', { productos, productosSugeridos });
};

exports.showProductDetail = (req, res) => {
  const rawId = req.params.id;
  const productId = productModel.normalizeId(rawId);

  if (productId === null) {
    return res.status(400).render('404', { title: 'ID de producto inválido', url: req.originalUrl });
  }

  const producto = productModel.getById(productId);

  if (!producto) {
    return res.status(404).render('404', { title: 'Producto no encontrado', url: req.originalUrl });
  }

  const productosRelacionados = productModel.getRelated(producto, 4);
  res.render('pages/product', { producto, productosRelacionados });
};