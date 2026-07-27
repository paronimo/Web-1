const express = require('express');
const router = express.Router();
const productsService = require('../services/productsService');
const { normalizeId } = require('../utils/idValidator');

// GET /api/products - Obtener todos los productos
router.get('/', (req, res) => {
  try {
    const category = req.query.category;
    const productos = category 
      ? productsService.getProductsByCategory(category)
      : productsService.getAllProducts();
    
    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos',
      message: error.message
    });
  }
});

// GET /api/products/:id - Obtener un producto específico
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const validation = normalizeId(id, {
      checkExists: checkId => productsService.getProductById(checkId) !== undefined
    });

    if (!validation.valid) {
      return res.status(validation.statusCode).json({
        success: false,
        error: validation.error
      });
    }

    const producto = productsService.getProductById(validation.id);
    
    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el producto',
      message: error.message
    });
  }
});

// GET /api/products/category/:category - Obtener productos por categoría
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const productos = productsService.getProductsByCategory(category);
    
    if (productos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron productos en esta categoría'
      });
    }

    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al buscar productos por categoría',
      message: error.message
    });
  }
});

// GET /api/products/suggested/:limit - Obtener productos sugeridos
router.get('/suggested/:limit?', (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;
    const productos = productsService.getSuggestedProducts(limit);
    
    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos sugeridos',
      message: error.message
    });
  }
});

module.exports = router;
