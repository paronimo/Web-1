# Documentación API - Mi Ecommerce

## ✅ Configuración Backend

Tu servidor backend está configurado para:
- ✅ **Procesar JSON**: `express.json()` está habilitado
- ✅ **CORS habilitado**: Acepta peticiones desde otros puertos/dominios
- ✅ **Prefijo `/api`**: Todas las rutas JSON están bajo `/api`

---

## 🌐 Endpoints API

### 1. Productos

#### GET `/api/products` - Obtener todos los productos
```bash
curl http://localhost:3000/api/products
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "total": 7
}
```

#### GET `/api/products?category=Hogar` - Productos por categoría
```bash
curl http://localhost:3000/api/products?category=Hogar
```

#### GET `/api/products/:id` - Obtener un producto específico
```bash
curl http://localhost:3000/api/products/1
```

#### GET `/api/products/suggested/5` - Obtener productos sugeridos
```bash
curl http://localhost:3000/api/products/suggested/5
```

---

### 2. Carrito

#### GET `/api/cart` - Obtener carrito actual
```bash
curl http://localhost:3000/api/cart
```

#### POST `/api/cart/add` - Agregar producto al carrito
```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

#### POST `/api/cart/remove` - Eliminar producto del carrito
```bash
curl -X POST http://localhost:3000/api/cart/remove \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}'
```

#### PUT `/api/cart/update/:id` - Actualizar cantidad
```bash
curl -X PUT http://localhost:3000/api/cart/update/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

#### POST `/api/cart/empty` - Vaciar carrito
```bash
curl -X POST http://localhost:3000/api/cart/empty \
  -H "Content-Type: application/json"
```

---

## 🚀 Ejemplo: Consumir desde React

### Instalación de dependencias
```bash
npm install axios
```

### Archivo de configuración API
**`src/api/client.js`**
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Incluir cookies de sesión
});

export default apiClient;
```

### Hook personalizado para productos
**`src/hooks/useProducts.js`**
```javascript
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products');
      setProducts(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error };
};
```

### Hook personalizado para carrito
**`src/hooks/useCart.js`**
```javascript
import { useState } from 'react';
import apiClient from '../api/client';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/cart/add', {
        productId,
        quantity
      });
      setCart(response.data.data.items);
      return response.data;
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/cart/remove', {
        productId
      });
      setCart(response.data.data.items);
      return response.data;
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const response = await apiClient.put(`/cart/update/${productId}`, {
        quantity
      });
      setCart(response.data.data.items);
      return response.data;
    } catch (error) {
      console.error('Error actualizando carrito:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/cart/empty');
      setCart([]);
      return response.data;
    } catch (error) {
      console.error('Error vaciando carrito:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart
  };
};
```

### Uso en componentes
**`src/components/ProductList.jsx`**
```javascript
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

export const ProductList = () => {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div className="products">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <h3>{product.nombre}</h3>
          <p>${product.precio}</p>
          <button onClick={() => addToCart(product.id)}>
            Agregar al carrito
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## ✅ Validación de Requerimientos

- ✅ **CORS habilitado**: Peticiones desde `http://localhost:5173` (o cualquier puerto) funcionan sin errores
- ✅ **JSON parseado**: `app.use(express.json())` está habilitado
- ✅ **Prefijo `/api`**: Todas las rutas están bajo `/api`
- ✅ **POST y PUT**: Body JSON se parsea correctamente
- ✅ **Sin errores de seguridad**: CORS está correctamente configurado

---

## 🔒 Configuración CORS (app.js)

```javascript
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json()); // ← JSON habilitado aquí
```

Puedes modificar el array `origin` para agregar más dominios según sea necesario.

---

## 📝 Notas

- Las sessiones se mantienen a través de `credentials: true`
- El carrito está almacenado en la sesión del servidor
- Todas las respuestas siguen el formato `{ success: boolean, data: {...} }`
- Los errores devuelven `{ success: false, error: string, message: string }`
