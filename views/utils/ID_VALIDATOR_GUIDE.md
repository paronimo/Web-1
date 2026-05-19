# Guía del Validador de IDs

## Descripción
El módulo `idValidator.js` normaliza y valida IDs de productos antes de usarlos en el sistema. Garantiza que:

- **ID no numérico** → Error 400 (Bad Request)
- **ID numérico pero inexistente** → Error 404 (Not Found)
- **ID válido** → Procede normalmente

## Función Principal

### `normalizeId(id, options)`
Normaliza y valida un ID.

```javascript
const { normalizeId } = require('../utils/idValidator');
const productModel = require('../models/productModel');

// Uso básico
const validation = normalizeId(rawId, {
  checkExists: (id) => productModel.getById(id) !== undefined
});

// Resultado
if (validation.valid) {
  // {
  //   valid: true,
  //   id: 1,
  //   error: null,
  //   statusCode: 200
  // }
} else if (validation.statusCode === 400) {
  // ID no es numérico
  // {
  //   valid: false,
  //   id: null,
  //   error: 'ID debe ser un número entero positivo',
  //   statusCode: 400
  // }
} else if (validation.statusCode === 404) {
  // ID es numérico pero no existe
  // {
  //   valid: false,
  //   id: 1,
  //   error: 'Producto no encontrado',
  //   statusCode: 404
  // }
}
```

## Casos de Uso

### En Controladores
```javascript
const { normalizeId } = require('../utils/idValidator');

exports.showProductDetail = (req, res) => {
  const rawId = req.params.id;
  
  // Validar
  const validation = normalizeId(rawId, {
    checkExists: (id) => productModel.getById(id) !== undefined
  });
  
  // Manejar errores
  if (!validation.valid) {
    return res.status(validation.statusCode).render('404', {
      title: validation.error,
      url: req.originalUrl
    });
  }
  
  // Proceder con ID validado
  const producto = productsService.getProductById(validation.id);
  // ...
};
```

### En Servicios
```javascript
const { normalizeId } = require('../utils/idValidator');

function addProductToCart(productId, quantity) {
  // Validar ID
  const validation = normalizeId(productId, {
    checkExists: (id) => productModel.getById(id) !== undefined
  });
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      statusCode: validation.statusCode
    };
  }
  
  // Proceder con ID válido
  // ...
}
```

## IDs de Productos

Los IDs son numéricos (1-7):

| ID | Producto |
|----|----------|
| 1 | Macbook NEO |
| 2 | Botellita |
| 3 | Botella Verde |
| 4 | Taza Violeta |
| 5 | Vaso |
| 6 | Libros Personalizables |
| 7 | Bandeja Retro |

## Ejemplos de Validación

### ✅ ID Válido y Existente
```javascript
normalizeId('1', { checkExists: (id) => productModel.getById(id) !== undefined });
// → { valid: true, id: 1, error: null, statusCode: 200 }
```

### ❌ ID No Numérico
```javascript
normalizeId('abc', { checkExists: (id) => productModel.getById(id) !== undefined });
// → { valid: false, id: null, error: 'ID debe ser un número entero positivo', statusCode: 400 }
```

### ❌ ID Numérico pero Inexistente
```javascript
normalizeId('999', { checkExists: (id) => productModel.getById(id) !== undefined });
// → { valid: false, id: 999, error: 'Producto no encontrado', statusCode: 404 }
```

### ❌ ID Vacío
```javascript
normalizeId('', { checkExists: (id) => productModel.getById(id) !== undefined });
// → { valid: false, id: null, error: 'ID es requerido', statusCode: 400 }
```

### ❌ ID Negativo
```javascript
normalizeId('-5', { checkExists: (id) => productModel.getById(id) !== undefined });
// → { valid: false, id: null, error: 'ID debe ser un número entero positivo', statusCode: 400 }
```

## Middleware (Opcional)

Existe un middleware que valida automáticamente:

```javascript
const { validateIdMiddleware } = require('../utils/idValidator');

// En rutas
router.get(
  '/:id',
  validateIdMiddleware(
    (id) => productModel.getById(id) !== undefined,
    'id'
  ),
  productController.showProductDetail
);

// El middleware:
// 1. Valida el ID
// 2. Si es inválido, renderiza 404 con statusCode apropiado
// 3. Si es válido, normaliza y continúa
```

## Ventajas

✅ **Validación Centralizada**: Un solo lugar para lógica de validación
✅ **Errores Claros**: Diferencia entre 400 y 404
✅ **Reutilizable**: Usado en controladores, servicios, middlewares
✅ **Robusto**: Maneja casos edge (vacío, negativo, decimal, etc.)
✅ **Seguro**: Previene inyección de datos inválidos
✅ **Compatible**: Funciona con DB cuando se migre

## Migración a Base de Datos

Cuando migres a BD, solo necesitas actualizar la función `checkExists`:

```javascript
// Ahora
normalizeId(id, { 
  checkExists: (id) => productModel.getById(id) !== undefined 
});

// Con MongoDB (futuro)
normalizeId(id, { 
  checkExists: (id) => await Product.findById(id) 
});

// El resto del código sigue igual
```

