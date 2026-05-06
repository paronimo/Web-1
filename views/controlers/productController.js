const productModel = require('../models/productModel');
// Controlador para productos
exports.showProductList = (req, res) => {
  const productos = productModel.getAll();
  const productosSugeridos = productos.slice(0, 5);
  res.render('pages/index', { productos, productosSugeridos });
};
// esto es para mostrar el detalle de un producto específico, obteniendo su ID de la URL y buscando
//  el producto en la base de datos. Si el producto no se encuentra, se muestra una página 404 personalizada. 
// Además, se obtienen productos relacionados para mostrar sugerencias al usuario.
exports.showProductDetail = (req, res) => {
  const productId = req.params.id;
  const producto = productModel.getById(productId);

  if (!producto) {
    return res.status(404).render('404', { title: 'Producto no encontrado', url: req.originalUrl });
  }
//Esto es para obtener productos relacionados, que podrían ser productos similares o de la misma categoría, 
// y se limita a mostrar 4 sugerencias. Luego, se renderiza la página de detalle del producto, 
// pasando tanto el producto encontrado como los productos relacionados para que puedan ser mostrados en la vista.
  const productosRelacionados = productModel.getRelated(producto, 4);
  res.render('pages/product', { producto, productosRelacionados });
};