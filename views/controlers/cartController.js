const cartService = require('../services/cartService');
const { normalizeId } = require('../utils/idValidator');
const productModel = require('../models/productModel');

/**
 * Controlador de Carrito
 * Coordina las operaciones del carrito delegando la lógica al servicio
 * Valida IDs antes de operaciones
 */

/**
 * Muestra la página del carrito con todos sus items
 */
exports.showCart = (req, res) => {
  const summary = cartService.getCartSummary(req.session.cart);
  
  // Validar integridad del carrito
  const validation = cartService.validateCart(req.session.cart);
  
  res.render('pages/cart', { 
    cartItems: summary.items, 
    total: summary.total,
    cartValid: validation.valid,
    invalidItems: validation.invalidItems
  });
};

/**
 * Agrega un producto al carrito
 * Valida que el ID sea numérico antes de agregar
 */
exports.addProduct = (req, res) => {
  const { productId } = req.body;
  const quantity = parseInt(req.body.quantity) || 1;
  
  // Normalizar y validar ID
  const validation = normalizeId(productId, {
    checkExists: (id) => productModel.getById(id) !== undefined
  });
  
  // Si el ID no es válido, redirigir sin agregar
  if (!validation.valid) {
    return res.redirect(req.headers.referer || '/');
  }
  
  // Operación del servicio con ID validado
  const result = cartService.addProduct(req.session.cart, validation.id, quantity);
  
  // Actualizar sesión si fue exitoso
  if (result.success) {
    req.session.cart = result.cart;
    req.session.save();
  }
  
  // Redirigir a la página anterior o inicio
  res.redirect(req.headers.referer || '/');
};

/**
 * Quita un producto del carrito
 * Valida que el ID sea numérico
 */
exports.removeProduct = (req, res) => {
  const { productId } = req.body;
  
  // Normalizar y validar ID
  const validation = normalizeId(productId, {
    checkExists: (id) => productModel.getById(id) !== undefined
  });
  
  // Si el ID no es válido, redirigir sin quitar
  if (!validation.valid) {
    return res.redirect('/cart');
  }
  
  // Operación del servicio con ID validado
  const result = cartService.removeProduct(req.session.cart, validation.id);
  
  // Actualizar sesión si fue exitoso
  if (result.success) {
    req.session.cart = result.cart;
    req.session.save();
  }
  
  // Redirigir al carrito
  res.redirect('/cart');
};

/**
 * Actualiza la cantidad de un producto en el carrito
 * Valida que el ID sea numérico
 */
exports.updateQuantity = (req, res) => {
  const { productId } = req.body;
  const newQuantity = parseInt(req.body.quantity);
  
  // Validar cantidad
  if (isNaN(newQuantity)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cantidad inválida' 
    });
  }
  
  // Normalizar y validar ID
  const validation = normalizeId(productId, {
    checkExists: (id) => productModel.getById(id) !== undefined
  });
  
  // Si el ID no es válido
  if (!validation.valid) {
    return res.status(validation.statusCode).json({
      success: false,
      message: validation.error
    });
  }
  
  // Operación del servicio con ID validado
  const result = cartService.updateQuantity(req.session.cart, validation.id, newQuantity);
  
  // Actualizar sesión si fue exitoso
  if (result.success) {
    req.session.cart = result.cart;
    req.session.save();
  }
  
  // Si es petición AJAX, retornar JSON
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    return res.json({
      success: result.success,
      message: result.message,
      cartSummary: cartService.getCartSummary(req.session.cart)
    });
  }
  
  // Si no, redirigir al carrito
  res.redirect('/cart');
};

/**
 * Vacía completamente el carrito
 */
exports.clearCart = (req, res) => {
  // Operación del servicio
  const result = cartService.clearCart(req.session.cart);
  
  // Actualizar sesión
  req.session.cart = result.cart;
  req.session.save();
  
  res.redirect('/cart');
};

/**
 * Obtiene el resumen del carrito (para AJAX/API)
 */
exports.getCartSummary = (req, res) => {
  const summary = cartService.getCartSummary(req.session.cart);
  
  res.json({
    success: true,
    summary
  });
};
