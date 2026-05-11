# Guía del Servicio de Productos

## Descripción
El módulo `productsService.js` centraliza toda la lógica de lectura y filtrado de productos, manteniendo los controladores limpios y preparando la arquitectura para migración a base de datos.

## Métodos Disponibles

### Métodos Básicos

#### `getAllProducts()`
Obtiene todos los productos disponibles.
```javascript
const products = productsService.getAllProducts();
```

#### `getProductById(id)`
Obtiene un producto específico por su ID.
```javascript
const product = productsService.getProductById('macbook');
```

#### `getSuggestedProducts(limit)`
Obtiene los primeros N productos como sugerencias.
```javascript
const suggested = productsService.getSuggestedProducts(5);
```

#### `getRelatedProducts(product, limit)`
Obtiene productos relacionados (misma categoría).
```javascript
const related = productsService.getRelatedProducts(producto, 4);
```

### Métodos de Filtrado

#### `getProductsByCategory(category, limit)`
Filtra productos por categoría.
```javascript
const homeProducts = productsService.getProductsByCategory('Hogar');
const limited = productsService.getProductsByCategory('Electrónica', 10);
```

#### `getProductsByPriceRange(minPrice, maxPrice)`
Filtra productos dentro de un rango de precio.
```javascript
const affordable = productsService.getProductsByPriceRange(0, 100);
```

#### `getProductsInStock(minStock)`
Obtiene solo productos con stock disponible.
```javascript
const inStock = productsService.getProductsInStock();
```

#### `searchProducts(query)`
Busca productos por nombre o descripción.
```javascript
const results = productsService.searchProducts('botella');
```

#### `filterProducts(filters)`
Aplica múltiples filtros simultáneamente.
```javascript
const filtered = productsService.filterProducts({
  category: 'Hogar',
  minPrice: 50,
  maxPrice: 150,
  inStock: true,
  sortBy: 'precio',
  sortOrder: 'asc'
});
```

Opciones de filtros:
- `category` (string): Filtrar por categoría
- `minPrice` (number): Precio mínimo
- `maxPrice` (number): Precio máximo
- `inStock` (boolean): Solo productos con stock
- `sortBy` (string): 'precio' o 'nombre'
- `sortOrder` (string): 'asc' o 'desc'

### Métodos de Ordenamiento

#### `sortByPrice(products, order)`
Ordena un array de productos por precio.
```javascript
const products = productsService.getAllProducts();
const sorted = productsService.sortByPrice(products, 'desc');
```

#### `sortByName(products)`
Ordena un array de productos por nombre (alfabéticamente).
```javascript
const products = productsService.getAllProducts();
const sorted = productsService.sortByName(products);
```

### Métodos de Utilidad

#### `getStatistics()`
Obtiene estadísticas generales de productos.
```javascript
const stats = productsService.getStatistics();
// {
//   total: 7,
//   enStock: 6,
//   sinStock: 1,
//   precioPromedio: '120.14',
//   precioMinimo: 60,
//   precioMaximo: 170,
//   categorias: ['Electrónica', 'Hogar', 'Educación'],
//   stockTotal: 53
// }
```

## Migración a Base de Datos

Cuando sea momento de migrar a una base de datos, **solo necesitas cambiar el módulo `productModel.js`**.

El servicio mantendrá la misma interfaz, por lo que los controladores **no requieren cambios**.

Ejemplo de cómo adaptaría `productModel.js` para MongoDB:

```javascript
const Product = require('./Product'); // Modelo de Mongoose

function getAll() {
  return Product.find().lean();
}

function getById(id) {
  return Product.findById(id).lean();
}

function getRelated(product, limit) {
  return Product.find({ 
    categoria: product.categoria, 
    _id: { $ne: product._id } 
  })
  .limit(limit)
  .lean();
}

module.exports = { getAll, getById, getRelated };
```

## Ventajas de Esta Arquitectura

✅ **Separación de responsabilidades**: Controlador solo renderiza, Servicio accede a datos
✅ **Fácil testing**: Puedes testear la lógica sin renderizar vistas
✅ **Migración simple**: Cambias el modelo, todo sigue funcionando
✅ **Reutilizable**: Puedes usar el servicio en APIs, WebSockets, etc.
✅ **Mantenible**: Cambios centralizados en un solo lugar
