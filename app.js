require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const { verifyToken, loadUser, isNotAuthenticated } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const centerRoutes = require('./routes/centers');

const app = express();

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Rutas públicas (sin autenticación)
app.use('/', authRoutes);

// Middleware de autenticación para rutas protegidas
app.use(verifyToken);
app.use(loadUser);

// Rutas protegidas
app.use('/centers', centerRoutes);

// Ruta principal
app.get('/', (req, res) => {
    if (!req.userId) {
        return res.redirect('/login');
    }
    res.redirect('/centers');
});

// Manejo de errores 404
app.use((req, res, next) => {
    res.status(404).render('error', {
        error: 'Página no encontrada'
    });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
}); 