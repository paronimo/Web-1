const express = require('express');
const router = express.Router();
const productController = require('../controlers/productController');

router.get('/', productController.showProductList);
router.get('/:id', productController.showProductDetail);

module.exports = router;