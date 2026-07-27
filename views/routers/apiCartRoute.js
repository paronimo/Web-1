const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');
const productsService = require('../services/productsService');
const { normalizeId } = require('../utils/idValidator');

// GET /api/cart - Obtener carrito actual
router.get('/', (req, res) => {
  try {
    const summary = cartService.getCartSummary(req.session.cart || []);
    
    res.json({
      success: true,
      data: {
        items: summary.items,
        total: summary.total,
        count: summary.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el carrito',
      message: error.message
    });
  }
});

// POST /api/cart/add - Agregar producto al carrito
router.post('/add', (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'El campo productId es requerido'
      });
    }

    const validation = normalizeId(productId, {
      checkExists: id => productsService.getProductById(id) !== undefined
    });

    if (!validation.valid) {
      return res.status(validation.statusCode).json({
        success: false,
        error: validation.error
      });
    }

    req.session.cart = req.session.cart || [];
    const result = cartService.addProduct(req.session.cart, validation.id, parseInt(quantity) || 1);

    if (result.success) {
      req.session.cart = result.cart;
      req.session.save();

      const summary = cartService.getCartSummary(req.session.cart);
      return res.json({
        success: true,
        data: {
          items: summary.items,
          total: summary.total,
          message: 'Producto agregado al carrito'
        }
      });
    }

    res.status(400).json({
      success: false,
      error: 'No se pudo agregar el producto'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al agregar producto al carrito',
      message: error.message
    });
  }
});

// POST /api/cart/remove - Eliminar producto del carrito
router.post('/remove', (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'El campo productId es requerido'
      });
    }

    const validation = normalizeId(productId, {
      checkExists: id => productsService.getProductById(id) !== undefined
    });

    if (!validation.valid) {
      return res.status(validation.statusCode).json({
        success: false,
        error: validation.error
      });
    }

    req.session.cart = req.session.cart || [];
    req.session.cart = req.session.cart.filter(item => item.id !== validation.id);
    req.session.save();

    const summary = cartService.getCartSummary(req.session.cart);
    res.json({
      success: true,
      data: {
        items: summary.items,
        total: summary.total,
        message: 'Producto eliminado del carrito'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar producto del carrito',
      message: error.message
    });
  }
});

// PUT /api/cart/update/:id - Actualizar cantidad de producto
router.put('/update/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'La cantidad debe ser un número positivo'
      });
    }

    const validation = normalizeId(id, {
      checkExists: checkId => productsService.getProductById(checkId) !== undefined
    });

    if (!validation.valid) {
      return res.status(validation.statusCode).json({
        success: false,
        error: validation.error
      });
    }

    req.session.cart = req.session.cart || [];
    
    if (quantity === 0) {
      req.session.cart = req.session.cart.filter(item => item.id !== validation.id);
    } else {
      const item = req.session.cart.find(item => item.id === validation.id);
      if (item) {
        item.quantity = parseInt(quantity);
      }
    }

    req.session.save();

    const summary = cartService.getCartSummary(req.session.cart);
    res.json({
      success: true,
      data: {
        items: summary.items,
        total: summary.total,
        message: 'Carrito actualizado'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el carrito',
      message: error.message
    });
  }
});

// POST /api/cart/empty - Vaciar carrito
router.post('/empty', (req, res) => {
  try {
    req.session.cart = [];
    req.session.save();

    res.json({
      success: true,
      data: {
        items: [],
        total: 0,
        message: 'Carrito vaciado'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al vaciar el carrito',
      message: error.message
    });
  }
});

module.exports = router;
