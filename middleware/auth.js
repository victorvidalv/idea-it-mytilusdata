const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Verificar token JWT
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['x-access-token'];

    if (!token) {
        req.userId = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        req.userId = decoded.id;
        next();
    } catch (err) {
        req.userId = null;
        res.clearCookie('token');
        next();
    }
};

// Cargar datos del usuario autenticado
const loadUser = async (req, res, next) => {
    if (!req.userId) {
        return next();
    }

    try {
        const user = await User.findById(req.userId);
        if (user) {
            req.user = user;
            res.locals.user = user;
        }
        next();
    } catch (err) {
        next(err);
    }
};

// Verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    if (!req.userId) {
        return res.redirect('/login');
    }
    next();
};

// Verificar si el usuario NO está autenticado (para rutas de login/registro)
const isNotAuthenticated = (req, res, next) => {
    if (req.userId) {
        return res.redirect('/');
    }
    next();
};

// Generar token JWT
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'default_secret_key',
        { expiresIn: '24h' }
    );
};

function validatePassword(password) {
    const requirements = {
        minLength: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return {
        isValid: Object.values(requirements).every(Boolean),
        requirements
    };
}

module.exports = {
    verifyToken,
    loadUser,
    isAuthenticated,
    isNotAuthenticated,
    generateToken,
    validatePassword
};