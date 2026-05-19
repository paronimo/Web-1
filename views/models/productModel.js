const db = require('../db/database');

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

module.exports = {
  getAll,
  getById,
  getRelated
};
