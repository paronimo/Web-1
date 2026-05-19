const products = [
  {
    id: 1,
    nombre: 'Macbook NEO',
    precio: 100,
    imagen: '/images/macbookneo.png',
    stock: 5,
    categoria: 'Electrónica',
    descripcion: 'Laptop de última generación con procesador de alto rendimiento, pantalla retina y batería de larga duración.'
  },
  {
    id: 2,
    nombre: 'Botellita',
    precio: 170,
    imagen: '/images/botellita.jpg',
    stock: 12,
    categoria: 'Hogar',
    descripcion: 'Botella reusable de diseño moderno, ideal para llevar tu bebida favorita a todas partes.'
  },
  {
    id: 3,
    nombre: 'Botella Verde',
    precio: 165,
    imagen: '/images/botella_verde.png',
    stock: 8,
    categoria: 'Hogar',
    descripcion: 'Botella ecológica con acabado matte, perfecta para beber agua durante el día.'
  },
  {
    id: 4,
    nombre: 'Taza Violeta',
    precio: 60,
    imagen: '/images/taza_violeta.png',
    stock: 0,
    categoria: 'Hogar',
    descripcion: 'Taza cerámica de edición especial con un color vibrante y diseño cuidado.'
  },
  {
    id: 5,
    nombre: 'Vaso',
    precio: 80,
    imagen: '/images/vaso.png',
    stock: 18,
    categoria: 'Hogar',
    descripcion: 'Vaso resistente y elegante, ideal para cualquier bebida fría o caliente.'
  },
  {
    id: 6,
    nombre: 'Libros Personalizables',
    precio: 120,
    imagen: '/images/libros_personalizables.png',
    stock: 6,
    categoria: 'Educación',
    descripcion: 'Set de libros personalizables pensados para creatividad y aprendizaje.'
  },
  {
    id: 7,
    nombre: 'Bandeja Retro',
    precio: 140,
    imagen: '/images/bandeja.png',
    stock: 4,
    categoria: 'Hogar',
    descripcion: 'Bandeja de estilo retro para servir bebidas y snacks con mucho estilo.'
  }
];

function getAll() {
  return products;
}

function normalizeId(id) {
  const numId = Number(id);
  if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
    return null;
  }
  return numId;
}

function getById(id) {
  return products.find(product => product.id === id);
}

function getRelated(product, limit = 4) {
  return products
    .filter(item => item.categoria === product.categoria && item.id !== product.id)
    .slice(0, limit);
}

module.exports = {
  getAll,
  getById,
  getRelated,
  normalizeId
};
