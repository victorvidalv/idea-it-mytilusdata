const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { generateToken, isNotAuthenticated, validatePassword } = require('../middleware/auth');

// Ruta GET para mostrar formulario de registro
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('auth/register', { error: null });
});

// Ruta POST para procesar el registro
router.post('/register', isNotAuthenticated, async (req, res) => {
    try {
        const { name, email, password, confirm_password } = req.body;

        // Validar que las contraseñas coincidan
        if (password !== confirm_password) {
            return res.render('auth/register', {
                error: 'Las contraseñas no coinciden',
                name,
                email
            });
        }

        // Validar requisitos de contraseña
        const { isValid, requirements } = validatePassword(password);
        if (!isValid) {
            return res.render('auth/register', {
                error: 'La contraseña debe contener al menos 8 caracteres, una mayúscula, un número y un carácter especial',
                name,
                email,
                passwordRequirements: requirements
            });
        }

        // Verificar si el email ya está registrado
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.render('auth/register', {
                error: 'El email ya está registrado',
                name
            });
        }

        // Crear el usuario
        const user = await User.create({ name, email, password });
        
        // Generar token y establecer cookie
        const token = generateToken(user.id);
        res.cookie('token', token, { httpOnly: true });
        
        res.redirect('/');
    } catch (err) {
        console.error('Error en registro:', err);
        res.render('auth/register', {
            error: 'Error al crear el usuario',
            name,
            email
        });
    }
});

// Ruta GET para mostrar formulario de login
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('auth/login', { error: null });
});

// Ruta POST para procesar el login
router.post('/login', isNotAuthenticated, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar credenciales
        const user = await User.validateCredentials(email, password);
        if (!user) {
            return res.render('auth/login', {
                error: 'Credenciales inválidas'
            });
        }

        // Generar token y establecer cookie
        const token = generateToken(user.id);
        res.cookie('token', token, { httpOnly: true });
        
        res.redirect('/');
    } catch (err) {
        console.error('Error en login:', err);
        res.render('auth/login', {
            error: 'Error al iniciar sesión'
        });
    }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

module.exports = router;