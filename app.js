const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const fs = require('fs');
const productRouter = require('./views/routers/productRoute');
const productModel = require('./views/models/productModel');
const morgan = require("morgan");
const favicon = require("serve-favicon");

const app = express();
app.use(morgan("common"))

app.use(
	favicon(path.join(__dirname, "public", "favicon.ico"))
);
// Función de validación de contraseña
function validatePassword(password, name, email) {
  const errors = [];
  const siteName = 'Mi Ecommerce';
  const prohibitedStrings = ['password', '1234', 'qwerty'];

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Incluir al menos una letra');
  }
  if (!/\d/.test(password)) {
    errors.push('Incluir al menos un número');
  }
  if (!/[!@#$%^&*(),.?":{}<>|]/.test(password)) {
    errors.push('Incluir un carácter especial (! @ # $ % ^ & * ( ) , . ? " : { } | < >)');
  }

  const lowerPassword = password.toLowerCase();
  for (let forbidden of prohibitedStrings) {
    if (lowerPassword.includes(forbidden)) {
      errors.push(`No puede contener: "${forbidden}"`);
    }
  }

  if (lowerPassword.includes(siteName.toLowerCase())) {
    errors.push(`No puede contener el nombre del sitio: "${siteName}"`);
  }

  if (name && lowerPassword.includes(name.toLowerCase())) {
    errors.push('No puede contener tu nombre de usuario');
  }

  if (email && lowerPassword.includes(email.toLowerCase())) {
    errors.push('No puede ser igual a tu email');
  }

  return errors;
}

// Función para obtener usuarios
function getUsers() {
  const usersPath = path.join(__dirname, 'users.json');
  try {
    const data = fs.readFileSync(usersPath, 'utf8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
}

// Función para guardar usuarios
function saveUsers(users) {
  const usersPath = path.join(__dirname, 'users.json');
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// Función para encontrar usuario por email
function findUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'un-secreto-seguro',
  resave: false,
  saveUninitialized: true

}));

app.use((req, res, next) => {
  req.session.cart = req.session.cart || [];
  res.locals.cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
  res.locals.user = 'Invitado';
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const productos = productModel.getAll();
  const productosSugeridos = productos.slice(0, 5);
  res.render('pages/index', { productos, productosSugeridos });
});

app.post('/cart/add', (req, res) => {
  const { productId } = req.body;
  const product = productModel.getById(productId);
  if (!product) {
    return res.redirect(req.headers.referer || '/');
  }

  const existing = req.session.cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    req.session.cart.push({ productId, quantity: 1 });
  }

  res.redirect(req.headers.referer || '/');
});

app.get('/cart', (req, res) => {
  const cartItems = req.session.cart
    .map(item => {
      const product = productModel.getById(item.productId);
      return product ? { ...product, quantity: item.quantity, subtotal: product.precio * item.quantity } : null;
    })
    .filter(Boolean);
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  res.render('pages/cart', { cartItems, total });
});

app.get('/login', (req, res) => res.render('pages/login', { layout: false }));
app.get('/register', (req, res) => res.render('pages/register', { layout: false }));

app.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validar campos requeridos
  if (!name || !email || !password || !confirmPassword) {
    return res.render('pages/register', { 
      layout: false, 
      error: 'Todos los campos son requeridos' 
    });
  }

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    return res.render('pages/register', { 
      layout: false, 
      error: 'Las contraseñas no coinciden' 
    });
  }

  // Validar contraseña
  const passwordErrors = validatePassword(password, name, email);
  if (passwordErrors.length > 0) {
    return res.render('pages/register', { 
      layout: false, 
      error: 'Contraseña inválida: ' + passwordErrors.join(', ') 
    });
  }

  // Validar que el email no exista
  if (findUserByEmail(email)) {
    return res.render('pages/register', { 
      layout: false, 
      error: 'El email ya está registrado' 
    });
  }

  // Crear nuevo usuario
  const users = getUsers();
  users.push({
    id: Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: password, // En producción, usar bcrypt para encriptar
    createdAt: new Date().toISOString()
  });

  saveUsers(users);

  // Redirigir a login con mensaje de éxito
  req.session.registerSuccess = true;
  res.redirect('/login');
});

app.use('/products', productRouter);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada', url: req.url });
});

app.listen(3000, () => console.log('servidor corriendo en http://localhost:3000'));  