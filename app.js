const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => res.render('pages/login'));
app.get('/products', (req, res) => res.render('pages/product'));
app.get('/cart', (req, res) => res.render('pages/cart'));
app.get('/checkout', (req, res) => res.render('pages/checkout'));
app.get('/', (req, res) => res.render('pages/index'));
app.get('/register', (req, res) => res.render('pages/register'));

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
