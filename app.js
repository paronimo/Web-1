const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const productRouter = require('./views/routers/productRoute');
const productsService = require('./views/services/productsService');
const cartService = require('./views/services/cartService');
const { normalizeId } = require('./views/utils/idValidator');
const morgan = require("morgan");
const favicon = require("serve-favicon");
const cors = require("cors");
const db = require('./db/database');
const bcrypt = require('bcryptjs');

const app = express();
const allowedOrigins = ['http://localhost:3000'];
// Helmet para seguridad
const helmet = require('helmet');
app.use(morgan("common"))
// Middleware para servir favicon
app.use(
	favicon(path.join(__dirname, "public", "favicon.ico"))
);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (ej: Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true); // Permitir este origen
    } else {
      return callback(new Error("Origen no permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // solo si usás cookies o tokens en headers
  maxAge: 600 // cache del preflight (en segundos)
}));

app.use(helmet());
const rateLimit = require("express-rate-limit");

// Límite general para toda la app
const appLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,                 // 100 requests por IP
  standardHeaders: true,    // Devuelve RateLimit-* headers
  legacyHeaders: false      // Desactiva X-RateLimit-* headers antiguos
});

app.use("/api", appLimiter);

// Función de validación de contraseña
// Reglas: mínimo 8 caracteres, al menos una letra, un número, un carácter especial, no contener "password", "1234", "qwerty", el nombre del sitio, el nombre de usuario o el email.

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

  // Verificar que no contenga palabras prohibidas o información personal
  const lowerPassword = password.toLowerCase();
  for (let forbidden of prohibitedStrings) {
    if (lowerPassword.includes(forbidden)) {
      errors.push(`No puede contener: "${forbidden}"`);
    }
  }
// Verificar que no contenga el nombre del sitio, nombre de usuario o email
  if (lowerPassword.includes(siteName.toLowerCase())) {
    errors.push(`No puede contener el nombre del sitio: "${siteName}"`);
  }
// Verificar que no contenga el nombre de usuario o email (si se proporcionan)
  if (name && lowerPassword.includes(name.toLowerCase())) {
    errors.push('No puede contener tu nombre de usuario');
  }

  if (email && lowerPassword.includes(email.toLowerCase())) {
    errors.push('No puede ser igual a tu email');
  }

  return errors;
}

// Función para encontrar usuario por email (usa SQLite)
function findUserByEmail(email) {
  try {
    const stmt = db.prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1');
    const user = stmt.get(email);
    return user || null;
  } catch (err) {
    return null;
  }
}
// Configuración de EJS y middlewares
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
// Middleware para manejar el carrito y usuario en las vistas
app.use((req, res, next) => {
  req.session.cart = req.session.cart || [];
  res.locals.cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
  res.locals.user = req.session.user ? req.session.user.name : 'Invitado';
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
// Rutas principales
app.get('/', (req, res) => {
  const productos = productsService.getAllProducts();
  const productosSugeridos = productsService.getSuggestedProducts(5);
  res.render('pages/index', { productos, productosSugeridos });
});

app.post('/cart/add', (req, res) => {
  const { productId } = req.body;
  const validation = normalizeId(productId, {
    checkExists: id => productsService.getProductById(id) !== undefined
  });

  if (!validation.valid) {
    return res.status(validation.statusCode).render('404', {
      title: validation.error,
      url: req.originalUrl
    });
  }

  const result = cartService.addProduct(req.session.cart, validation.id, 1);
  if (result.success) {
    req.session.cart = result.cart;
  }

  res.redirect(req.headers.referer || '/');
});

app.get('/cart', (req, res) => {
  const summary = cartService.getCartSummary(req.session.cart);
  res.render('pages/cart', { cartItems: summary.items, total: summary.total });
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
  /* This code snippet is creating a new user object and adding it to the `users` array. Here's a
  breakdown of what each property represents: */
  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const insert = db.prepare('INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, datetime("now"))');
    const info = insert.run(name.trim(), email.toLowerCase().trim(), passwordHash);

    req.session.registerSuccess = true;
    return res.redirect('/login');
  } catch (err) {
    // posible conflicto de unique constraint
    return res.render('pages/register', { layout: false, error: 'No se pudo registrar el usuario' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.render('pages/login', { layout: false, error: 'Credenciales incorrectas' });

  try {
    const stmt = db.prepare('SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1');
    const user = stmt.get(email);
    if (!user) return res.render('pages/login', { layout: false, error: 'Credenciales incorrectas' });

    const ok = bcrypt.compareSync(password, user.password_hash || '');
    if (!ok) return res.render('pages/login', { layout: false, error: 'Credenciales incorrectas' });

    req.session.user = { id: user.id, name: user.name, email: user.email };
    return res.redirect('/');
  } catch (err) {
    return res.render('pages/login', { layout: false, error: 'Error al autenticar' });
  }
});

app.use('/products', productRouter);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada', url: req.url });
});

app.listen(3000, () => console.log('servidor corriendo en http://localhost:3000'));  