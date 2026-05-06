// Rutas para productos
const express = require('express');
const router = express.Router();
const productController = require('../controlers/productController');
//  la ruta base para productos es /products, 
// por lo que estas rutas se agregarán a esa base en app.js con app.use('/products', productRoute);

router.get('/', productController.showProductList);
router.get('/:id', productController.showProductDetail);

module.exports = router;