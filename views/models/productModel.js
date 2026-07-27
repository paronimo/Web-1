const db = require('../../db/database');

function mapProduct(row) {
  if (!row) return undefined;
  return {
    id: row.id,
    nombre: row.nombre,
    precio: row.precio,
    imagen: row.imagen,
    stock: row.stock,
    categoria: row.categoria,
    descripcion: row.descripcion
  };
}

function getAll() {
  return db.prepare('SELECT * FROM products ORDER BY id').all().map(mapProduct);
}

function getById(id) {
  return mapProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
}

function getRelated(product, limit = 4) {
  if (!product || !product.categoria) {
    return [];
  }

  return db
    .prepare('SELECT * FROM products WHERE categoria = ? AND id != ? LIMIT ?')
    .all(product.categoria, product.id, limit)
    .map(mapProduct);
}

function create(nombre, precio, imagen, stock, categoria, descripcion) {
  try {
    const insert = db.prepare('INSERT INTO products (nombre, precio, imagen, stock, categoria, descripcion) VALUES (?, ?, ?, ?, ?, ?)');
    const info = insert.run(nombre, precio, imagen, stock, categoria, descripcion);
    return { id: info.lastInsertRowid, nombre, precio, imagen, stock, categoria, descripcion };
  } catch (error) {
    return null;
  }
}

function update(id, nombre, precio, imagen, stock, categoria, descripcion) {
  try {
    const stmt = db.prepare('UPDATE products SET nombre = ?, precio = ?, imagen = ?, stock = ?, categoria = ?, descripcion = ? WHERE id = ?');
    const info = stmt.run(nombre, precio, imagen, stock, categoria, descripcion, id);
    if (info.changes === 0) return null;
    return { id, nombre, precio, imagen, stock, categoria, descripcion };
  } catch (error) {
    return null;
  }
}

function deleteProduct(id) {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getAll,
  getById,
  getRelated,
  create,
  update,
  deleteProduct
};