# Guía del Servicio de Carrito

## Descripción
El módulo `cartService.js` encapsula toda la lógica de manipulación del carrito, manteniendo los controladores simples y preparando la arquitectura para migración a base de datos.

**Importante**: El servicio manipula `req.session.cart` de forma segura y validada.

## Estructura del Carrito en Sesión
```javascript
req.session.cart = [
  { productId: 'macbook', quantity: 2 },
  { productId: 'botella-verde', quantity: 1 }
]
```

## Métodos Disponibles

### Métodos Básicos

#### `initCart(cart)`
Inicializa el carrito si no existe.
```javascript
const cart = cartService.initCart(req.session.cart);
```

#### `getCart(cart)`
Obtiene el carrito actual.
```javascript
const cart = cartService.getCart(req.session.cart);
```

#### `getCartCount(cart)`
Obtiene la cantidad total de items en el carrito.
```javascript
const count = cartService.getCartCount(req.session.cart);
// Resultado: 2 (sumando todas las cantidades)
```

### Operaciones de Carrito

#### `addProduct(cart, productId, quantity)`
Agrega un producto al carrito.
```javascript
const result = cartService.addProduct(
  req.session.cart, 
  'macbook', 
  1
);

if (result.success) {
  req.session.cart = result.cart;
  req.session.save();
} else {
  console.log(result.message); // Error message
}
```

Retorna:
```javascript
{
  success: true/false,
  message: 'Descripción de la operación',
  cart: Array // El carrito actualizado
}
```

**Validaciones**:
- Producto debe existir
- Cantidad debe ser entero >= 1
- Stock debe ser suficiente
- Si el producto ya existe, incrementa cantidad

#### `removeProduct(cart, productId)`
Quita un producto del carrito completamente.
```javascript
const result = cartService.removeProduct(req.session.cart, 'macbook');

if (result.success) {
  req.session.cart = result.cart;
  req.session.save();
}
```

#### `updateQuantity(cart, productId, newQuantity)`
Actualiza la cantidad de un producto.
```javascript
const result = cartService.updateQuantity(
  req.session.cart, 
  'macbook', 
  5
);

if (result.success) {
  req.session.cart = result.cart;
  req.session.save();
}
```

**Comportamiento especial**:
- Si `newQuantity` es 0, elimina el producto
- Valida stock disponible
- Valida cantidad entera

#### `clearCart(cart)`
Vacía completamente el carrito.
```javascript
const result = cartService.clearCart(req.session.cart);
req.session.cart = result.cart; // []
req.session.save();
```

### Consultas e Información

#### `getCartItems(cart)`
Obtiene los items del carrito con información completa del producto.
```javascript
const items = cartService.getCartItems(req.session.cart);
// Resultado:
// [
//   {
//     id: 'macbook',
//     nombre: 'Macbook NEO',
//     precio: 100,
//     imagen: '/images/macbookneo.png',
//     stock: 5,
//     categoria: 'Electrónica',
//     descripcion: '...',
//     quantity: 2,
//     subtotal: 200
//   },
//   ...
// ]
```

#### `calculateTotal(cart)`
Calcula el total del carrito.
```javascript
const total = cartService.calculateTotal(req.session.cart);
// Resultado: 520 (suma de todos los subtotales)
```

#### `getCartSummary(cart)`
Obtiene el resumen completo del carrito.
```javascript
const summary = cartService.getCartSummary(req.session.cart);
// Resultado:
// {
//   items: [...], // con todos los detalles
//   total: 520,
//   count: 3 // cantidad total de items
// }
```

### Validación

#### `validateCart(cart)`
Valida la integridad del carrito.
```javascript
const validation = cartService.validateCart(req.session.cart);
// Resultado:
// {
//   valid: true/false,
//   invalidItems: [
//     {
//       productId: 'producto-inexistente',
//       reason: 'Producto no encontrado'
//     },
//     {
//       productId: 'botella',
//       reason: 'Stock insuficiente. Disponibles: 2',
//       requested: 5,
//       available: 2
//     }
//   ]
// }
```

## Uso en Controladores

### Patrón Recomendado
```javascript
const cartService = require('../services/cartService');

exports.addProduct = (req, res) => {
  const { productId } = req.body;
  const quantity = parseInt(req.body.quantity) || 1;
  
  // Operación del servicio
  const result = cartService.addProduct(req.session.cart, productId, quantity);
  
  // Actualizar sesión solo si fue exitoso
  if (result.success) {
    req.session.cart = result.cart;
    req.session.save();
  }
  
  // Redirigir o responder
  res.redirect(req.headers.referer || '/');
};
```

## Middleware para Contar Items

Reemplaza esta línea en app.js:
```javascript
// ANTES:
res.locals.cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);

// AHORA:
res.locals.cartCount = cartService.getCartCount(req.session.cart);
```

## Migración a Base de Datos

Cuando sea momento de migrar a BD, el servicio seguirá manteniendo la misma interfaz. Solo cambian 2 cosas:

1. `req.session.cart` puede ser reemplazado por `userId` + query a BD
2. El servicio llama a una capa de datos en lugar de `productModel`

Ejemplo futuro con MongoDB:
```javascript
async function addProduct(userId, productId, quantity) {
  const product = await Product.findById(productId);
  if (!product || product.stock < quantity) {
    return { success: false, message: '...' };
  }
  
  // Operación en BD
  await Cart.findOneAndUpdate(
    { userId },
    { $inc: { 'items.$[elem].quantity': quantity } }
  );
  
  return { success: true, message: '...' };
}
```

## Ventajas de Esta Arquitectura

✅ **Encapsulación**: Toda lógica centralizada
✅ **Validación**: Todas las operaciones se validan
✅ **Seguridad**: `req.session.cart` solo se toca desde el servicio
✅ **Testeable**: Fácil de testear sin HTTP
✅ **Migrable**: Estructura lista para BD
✅ **Mantenible**: Cambios en un solo lugar
