const productModel = require('../models/productModel');

function initCart(session) {
  if (!session.cart) {
    session.cart = [];
  }
}

function addProduct(session, productId) {
  initCart(session);
  const existing = session.cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    session.cart.push({ productId, quantity: 1 });
  }
}

function removeProduct(session, productId) {
  initCart(session);
  session.cart = session.cart.filter(item => item.productId !== productId);
}

function updateQuantity(session, productId, quantity) {
  initCart(session);
  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return removeProduct(session, productId);
  }
  const existing = session.cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity = qty;
  }
}

function emptyCart(session) {
  session.cart = [];
}

function getCartDetails(session) {
  initCart(session);
  const cartItems = session.cart
    .map(item => {
      const product = productModel.getById(item.productId);
      return product ? { ...product, quantity: item.quantity, subtotal: product.precio * item.quantity } : null;
    })
    .filter(Boolean);
  
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  
  return { cartItems, total };
}

function getCartCount(session) {
  initCart(session);
  return session.cart.reduce((sum, item) => sum + item.quantity, 0);
}

module.exports = {
  addProduct,
  removeProduct,
  updateQuantity,
  emptyCart,
  getCartDetails,
  getCartCount
};
