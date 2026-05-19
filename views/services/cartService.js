const productsService = require('./productsService');

function initCart(cart) {
  return Array.isArray(cart) ? cart : [];
}

function addProduct(cart, productId, quantity = 1) {
  cart = initCart(cart);

  const product = productsService.getProductById(productId);
  if (!product) {
    return { success: false, message: 'Producto no encontrado' };
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { success: false, message: 'Cantidad inválida' };
  }

  const existing = cart.find(item => item.productId === productId);
  const requested = existing ? existing.quantity + quantity : quantity;

  if (product.stock < requested) {
    return { success: false, message: `Stock insuficiente. Disponibles: ${product.stock}` };
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  return { success: true, message: 'Producto agregado al carrito', cart };
}

function removeProduct(cart, productId) {
  cart = initCart(cart);
  const index = cart.findIndex(item => item.productId === productId);

  if (index === -1) {
    return { success: false, message: 'Producto no encontrado en el carrito', cart };
  }

  cart.splice(index, 1);
  return { success: true, message: 'Producto eliminado del carrito', cart };
}

function updateQuantity(cart, productId, newQuantity) {
  cart = initCart(cart);

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    return { success: false, message: 'Cantidad inválida' };
  }

  const item = cart.find(cartItem => cartItem.productId === productId);
  if (!item) {
    return { success: false, message: 'Producto no encontrado en el carrito', cart };
  }

  if (newQuantity === 0) {
    return removeProduct(cart, productId);
  }

  const product = productsService.getProductById(productId);
  if (!product) {
    return { success: false, message: 'Producto no encontrado' };
  }

  if (product.stock < newQuantity) {
    return { success: false, message: `Stock insuficiente. Disponibles: ${product.stock}` };
  }

  item.quantity = newQuantity;

  return { success: true, message: 'Cantidad actualizada', cart };
}

function clearCart(cart) {
  return { success: true, message: 'Carrito vaciado', cart: [] };
}

function calculateTotal(cart) {
  cart = initCart(cart);

  return cart.reduce((total, item) => {
    const product = productsService.getProductById(item.productId);
    if (!product) return total;
    return total + product.precio * item.quantity;
  }, 0);
}

function getCartItems(cart) {
  cart = initCart(cart);

  return cart
    .map(item => {
      const product = productsService.getProductById(item.productId);
      if (!product) return null;
      return { ...product, quantity: item.quantity, subtotal: product.precio * item.quantity };
    })
    .filter(Boolean);
}

function getCartSummary(cart) {
  const items = getCartItems(cart);
  const total = calculateTotal(cart);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return { items, total: parseFloat(total.toFixed(2)), count };
}

function validateCart(cart) {
  cart = initCart(cart);

  const invalidItems = cart.reduce((invalid, item) => {
    const product = productsService.getProductById(item.productId);
    if (!product) {
      invalid.push({ productId: item.productId, reason: 'Producto no encontrado' });
    } else if (item.quantity > product.stock) {
      invalid.push({ productId: item.productId, reason: `Stock insuficiente. Disponibles: ${product.stock}`, requested: item.quantity, available: product.stock });
    }
    return invalid;
  }, []);

  return { valid: invalidItems.length === 0, invalidItems };
}

function getCartCount(cart) {
  cart = initCart(cart);
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

module.exports = {
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
