const productsService = require('./productsService');

/**
 * Servicio de Carrito
 * Centraliza toda la lógica de manipulación del carrito
 * El carrito se almacena en req.session.cart como array de objetos:
 * { productId: string, quantity: number }
 */

/**
 * Inicializa el carrito si no existe
 * @param {Array} cart - El carrito actual de la sesión
 * @returns {Array} El carrito inicializado
 */
function initCart(cart) {
  return cart || [];
}

/**
 * Obtiene el carrito actual
 * @param {Array} cart - El carrito de la sesión
 * @returns {Array} El carrito
 */
function getCart(cart) {
  return initCart(cart);
}

/**
 * Agrega un producto al carrito
 * Si ya existe, incrementa la cantidad
 * @param {Array} cart - El carrito actual
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad a agregar (default: 1)
 * @returns {Object} { success: boolean, message: string, cart: Array }
 */
function addProduct(cart, productId, quantity = 1) {
  cart = initCart(cart);
  
  // Validar producto
  const product = productsService.getProductById(productId);
  if (!product) {
    return { 
      success: false, 
      message: 'Producto no encontrado' 
    };
  }
  
  // Validar cantidad
  if (quantity < 1 || !Number.isInteger(quantity)) {
    return { 
      success: false, 
      message: 'Cantidad inválida' 
    };
  }
  
  // Validar stock
  if (product.stock < quantity) {
    return { 
      success: false, 
      message: `Stock insuficiente. Disponibles: ${product.stock}` 
    };
  }
  
  // Buscar si ya existe
  const existing = cart.find(item => item.productId === productId);
  
  if (existing) {
    // Verificar stock total
    if (product.stock < existing.quantity + quantity) {
      return { 
        success: false, 
        message: `Stock insuficiente. Disponibles: ${product.stock}` 
      };
    }
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  return { 
    success: true, 
    message: 'Producto agregado al carrito',
    cart 
  };
}

/**
 * Quita un producto del carrito completamente
 * @param {Array} cart - El carrito actual
 * @param {string} productId - ID del producto a quitar
 * @returns {Object} { success: boolean, message: string, cart: Array }
 */
function removeProduct(cart, productId) {
  cart = initCart(cart);
  
  const index = cart.findIndex(item => item.productId === productId);
  
  if (index === -1) {
    return { 
      success: false, 
      message: 'Producto no encontrado en el carrito',
      cart 
    };
  }
  
  cart.splice(index, 1);
  
  return { 
    success: true, 
    message: 'Producto eliminado del carrito',
    cart 
  };
}

/**
 * Modifica la cantidad de un producto
 * @param {Array} cart - El carrito actual
 * @param {string} productId - ID del producto
 * @param {number} newQuantity - Nueva cantidad
 * @returns {Object} { success: boolean, message: string, cart: Array }
 */
function updateQuantity(cart, productId, newQuantity) {
  cart = initCart(cart);
  
  // Validar cantidad
  if (newQuantity < 0 || !Number.isInteger(newQuantity)) {
    return { 
      success: false, 
      message: 'Cantidad inválida' 
    };
  }
  
  // Si la cantidad es 0, eliminar el producto
  if (newQuantity === 0) {
    return removeProduct(cart, productId);
  }
  
  // Validar producto
  const product = productsService.getProductById(productId);
  if (!product) {
    return { 
      success: false, 
      message: 'Producto no encontrado' 
    };
  }
  
  // Validar stock
  if (product.stock < newQuantity) {
    return { 
      success: false, 
      message: `Stock insuficiente. Disponibles: ${product.stock}` 
    };
  }
  
  // Buscar producto en carrito
  const item = cart.find(cartItem => cartItem.productId === productId);
  
  if (!item) {
    return { 
      success: false, 
      message: 'Producto no encontrado en el carrito',
      cart 
    };
  }
  
  item.quantity = newQuantity;
  
  return { 
    success: true, 
    message: 'Cantidad actualizada',
    cart 
  };
}

/**
 * Vacía el carrito completamente
 * @param {Array} cart - El carrito actual
 * @returns {Object} { success: boolean, message: string, cart: Array }
 */
function clearCart(cart) {
  return { 
    success: true, 
    message: 'Carrito vaciado',
    cart: [] 
  };
}

/**
 * Calcula el total del carrito
 * @param {Array} cart - El carrito actual
 * @returns {number} Total del carrito
 */
function calculateTotal(cart) {
  cart = initCart(cart);
  
  return cart.reduce((total, item) => {
    const product = productsService.getProductById(item.productId);
    if (!product) return total;
    return total + (product.precio * item.quantity);
  }, 0);
}

/**
 * Obtiene los items del carrito con información completa del producto
 * @param {Array} cart - El carrito actual
 * @returns {Array} Array de items con datos del producto
 */
function getCartItems(cart) {
  cart = initCart(cart);
  
  return cart
    .map(item => {
      const product = productsService.getProductById(item.productId);
      if (!product) return null;
      
      return {
        ...product,
        quantity: item.quantity,
        subtotal: product.precio * item.quantity
      };
    })
    .filter(Boolean); // Remover items con productos no encontrados
}

/**
 * Obtiene el resumen completo del carrito
 * @param {Array} cart - El carrito actual
 * @returns {Object} { items: Array, total: number, count: number }
 */
function getCartSummary(cart) {
  const items = getCartItems(cart);
  const total = calculateTotal(cart);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    items,
    total: parseFloat(total.toFixed(2)),
    count
  };
}

/**
 * Valida si un carrito es válido (todos los productos existen)
 * @param {Array} cart - El carrito actual
 * @returns {Object} { valid: boolean, invalidItems: Array }
 */
function validateCart(cart) {
  cart = initCart(cart);
  
  const invalidItems = [];
  
  cart.forEach(item => {
    const product = productsService.getProductById(item.productId);
    
    if (!product) {
      invalidItems.push({
        productId: item.productId,
        reason: 'Producto no encontrado'
      });
    } else if (item.quantity > product.stock) {
      invalidItems.push({
        productId: item.productId,
        reason: `Stock insuficiente. Disponibles: ${product.stock}`,
        requested: item.quantity,
        available: product.stock
      });
    }
  });
  
  return {
    valid: invalidItems.length === 0,
    invalidItems
  };
}

/**
 * Obtiene la cantidad de items en el carrito
 * @param {Array} cart - El carrito actual
 * @returns {number} Cantidad total de items
 */
function getCartCount(cart) {
  cart = initCart(cart);
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

module.exports = {
  initCart,
  getCart,
  addProduct,
  removeProduct,
  updateQuantity,
  clearCart,
  calculateTotal,
  getCartItems,
  getCartSummary,
  validateCart,
  getCartCount
};
