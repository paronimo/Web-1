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
    const producto = productsService.getProductById(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

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

// POST /api/products - Crear nuevo producto
router.post('/', (req, res) => {
  try {
    const { nombre, precio, imagen, stock, categoria, descripcion } = req.body;

    // Validar campos requeridos
    if (!nombre || precio === undefined || !imagen || stock === undefined || !categoria || !descripcion) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: nombre, precio, imagen, stock, categoria, descripcion'
      });
    }

    // Validar tipos de datos
    if (typeof nombre !== 'string' || typeof precio !== 'number' || typeof stock !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Tipos de datos inválidos'
      });
    }

    const nuevoProducto = productsService.createProduct(nombre, precio, imagen, stock, categoria, descripcion);

    if (!nuevoProducto) {
      return res.status(500).json({
        success: false,
        error: 'Error al crear el producto'
      });
    }

    res.status(201).json({
      success: true,
      data: nuevoProducto,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al crear el producto',
      message: error.message
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, imagen, stock, categoria, descripcion } = req.body;

    // Verificar que el producto existe
    const producto = productsService.getProductById(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Validar campos requeridos
    if (!nombre || precio === undefined || !imagen || stock === undefined || !categoria || !descripcion) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: nombre, precio, imagen, stock, categoria, descripcion'
      });
    }

    const productoActualizado = productsService.updateProduct(id, nombre, precio, imagen, stock, categoria, descripcion);

    if (!productoActualizado) {
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar el producto'
      });
    }

    res.json({
      success: true,
      data: productoActualizado,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el producto',
      message: error.message
    });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el producto existe
    const producto = productsService.getProductById(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    const eliminado = productsService.deleteProduct(id);

    if (!eliminado) {
      return res.status(500).json({
        success: false,
        error: 'Error al eliminar el producto'
      });
    }

    res.json({
      success: true,
      data: { id },
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el producto',
      message: error.message
    });
  }
});

module.exports = router;