# Endpoints CRUD - API de Productos

## Resumen Rápido

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/api/products` | Obtener todos los productos | 200 OK |
| GET | `/api/products/:id` | Obtener un producto específico | 200 OK ó 404 |
| POST | `/api/products` | Crear nuevo producto | 201 Created |
| PUT | `/api/products/:id` | Actualizar producto existente | 200 OK |
| DELETE | `/api/products/:id` | Eliminar producto | 200 OK |

---

## 1. GET /api/products - Listar todos los productos

**Descripción:** Devuelve el listado completo de productos en JSON

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Macbook NEO",
      "precio": 100,
      "imagen": "/images/macbookneo.png",
      "stock": 5,
      "categoria": "Electrónica",
      "descripcion": "Laptop de última generación..."
    }
  ],
  "total": 7
}
```

**Comando curl:**
```bash
curl http://localhost:3000/api/products
```

---

## 2. GET /api/products/:id - Obtener detalle de un producto

**Descripción:** Obtiene un producto específico por su ID

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Macbook NEO",
    "precio": 100,
    "imagen": "/images/macbookneo.png",
    "stock": 5,
    "categoria": "Electrónica",
    "descripcion": "Laptop de última generación..."
  }
}
```

**Respuesta (404 No encontrado):**
```json
{
  "success": false,
  "error": "Producto no encontrado"
}
```

**Comando curl:**
```bash
curl http://localhost:3000/api/products/1
```

---

## 3. POST /api/products - Crear nuevo producto

**Descripción:** Crea un nuevo producto en la base de datos

**Body requerido:**
```json
{
  "nombre": "Nuevo Producto",
  "precio": 99.99,
  "imagen": "/images/nuevo.png",
  "stock": 15,
  "categoria": "Hogar",
  "descripcion": "Descripción del nuevo producto"
}
```

**Campos requeridos:**
- `nombre` (string)
- `precio` (número)
- `imagen` (string - ruta)
- `stock` (número)
- `categoria` (string)
- `descripcion` (string)

**Respuesta (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "nombre": "Nuevo Producto",
    "precio": 99.99,
    "imagen": "/images/nuevo.png",
    "stock": 15,
    "categoria": "Hogar",
    "descripcion": "Descripción del nuevo producto"
  },
  "message": "Producto creado exitosamente"
}
```

**Respuesta (400 - Campos faltantes):**
```json
{
  "success": false,
  "error": "Faltan campos requeridos: nombre, precio, imagen, stock, categoria, descripcion"
}
```

**Comando curl:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Producto",
    "precio": 99.99,
    "imagen": "/images/nuevo.png",
    "stock": 15,
    "categoria": "Hogar",
    "descripcion": "Descripción del nuevo producto"
  }'
```

**Ejemplo con JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Nuevo Producto',
    precio: 99.99,
    imagen: '/images/nuevo.png',
    stock: 15,
    categoria: 'Hogar',
    descripcion: 'Descripción del nuevo producto'
  })
});

const result = await response.json();
console.log(result);
```

---

## 4. PUT /api/products/:id - Actualizar producto

**Descripción:** Actualiza los datos de un producto existente

**Body requerido:**
```json
{
  "nombre": "Producto Actualizado",
  "precio": 120,
  "imagen": "/images/actualizado.png",
  "stock": 20,
  "categoria": "Electrónica",
  "descripcion": "Descripción actualizada"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Producto Actualizado",
    "precio": 120,
    "imagen": "/images/actualizado.png",
    "stock": 20,
    "categoria": "Electrónica",
    "descripcion": "Descripción actualizada"
  },
  "message": "Producto actualizado exitosamente"
}
```

**Respuesta (404 - No existe):**
```json
{
  "success": false,
  "error": "Producto no encontrado"
}
```

**Comando curl:**
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Producto Actualizado",
    "precio": 120,
    "imagen": "/images/actualizado.png",
    "stock": 20,
    "categoria": "Electrónica",
    "descripcion": "Descripción actualizada"
  }'
```

**Ejemplo con JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/api/products/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Producto Actualizado',
    precio: 120,
    imagen: '/images/actualizado.png',
    stock: 20,
    categoria: 'Electrónica',
    descripcion: 'Descripción actualizada'
  })
});

const result = await response.json();
console.log(result);
```

---

## 5. DELETE /api/products/:id - Eliminar producto

**Descripción:** Elimina un producto de la base de datos

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": { "id": "1" },
  "message": "Producto eliminado exitosamente"
}
```

**Respuesta (404 - No existe):**
```json
{
  "success": false,
  "error": "Producto no encontrado"
}
```

**Comando curl:**
```bash
curl -X DELETE http://localhost:3000/api/products/1
```

**Ejemplo con JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/api/products/1', {
  method: 'DELETE'
});

const result = await response.json();
console.log(result);
```

---

## Ejemplos de Uso en React

### Hook personalizado para CRUD de productos

```javascript
// hooks/useProductsCRUD.js
import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3000/api';

export const useProductsCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET todos
  const getAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // GET por ID
  const getById = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products/${id}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST crear
  const create = useCallback(async (producto) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // PUT actualizar
  const update = useCallback(async (id, producto) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE eliminar
  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove
  };
};
```

### Componente de ejemplo

```javascript
// components/ProductManager.jsx
import { useEffect, useState } from 'react';
import { useProductsCRUD } from '../hooks/useProductsCRUD';

export const ProductManager = () => {
  const { loading, error, getAll, create, update, remove } = useProductsCRUD();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    const data = await getAll();
    setProductos(data);
  };

  const handleCreate = async () => {
    const nuevoProducto = {
      nombre: 'Nuevo Producto',
      precio: 99.99,
      imagen: '/images/nuevo.png',
      stock: 10,
      categoria: 'Test',
      descripcion: 'Descripción de prueba'
    };
    
    const resultado = await create(nuevoProducto);
    if (resultado) {
      loadProductos(); // Recarga la lista
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Gestor de Productos</h2>
      <button onClick={handleCreate}>Crear Producto</button>
      <ul>
        {productos.map(p => (
          <li key={p.id}>{p.nombre} - ${p.precio}</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## Códigos HTTP Esperados

| Código | Significado | Cuándo |
|--------|------------|--------|
| 200 | OK | GET, PUT, DELETE exitosos |
| 201 | Created | POST exitoso |
| 400 | Bad Request | Campos faltantes o tipos inválidos |
| 404 | Not Found | Producto no existe |
| 500 | Server Error | Error en el servidor |

---

## Validaciones

✅ **POST/PUT validan:**
- Todos los campos requeridos estén presentes
- Los tipos de datos sean correctos (nombre string, precio/stock números)

✅ **GET por ID devuelve:**
- 404 si el producto no existe
- Mensaje JSON claramente identificable

✅ **DELETE valida:**
- Que el producto exista antes de eliminar
- 404 si no existe

---

## Notas

- Todos los endpoints aceptan y devuelven JSON
- CORS está habilitado (puedes consumir desde React/otros puertos)
- Los cambios se persisten en SQLite
- Las respuestas siguen el patrón: `{ success: boolean, data: {...}, message?: string }`
