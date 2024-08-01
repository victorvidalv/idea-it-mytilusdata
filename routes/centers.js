const express = require('express');
const router = express.Router();
const Center = require('../models/center');
const { isAuthenticated } = require('../middleware/auth');

// Middleware para verificar propiedad del centro
async function checkCenterOwnership(req, res, next) {
    try {
        const center = await Center.findById(req.params.id);
        if (!center) {
            return res.status(404).json({ error: 'Centro no encontrado' });
        }
        if (center.user_id !== req.userId) {
            return res.status(403).json({ error: 'No autorizado' });
        }
        req.center = center;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Error al verificar propiedad del centro' });
    }
}

// Listar todos los centros del usuario
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const centers = await Center.findByUserId(req.userId);
        res.render('centers/index', { centers });
    } catch (err) {
        res.status(500).render('error', { error: 'Error al obtener los centros' });
    }
});

// Mostrar formulario para crear nuevo centro
router.get('/new', isAuthenticated, (req, res) => {
    res.render('centers/new');
});

// Ruta para comparar centros
router.get('/compare', isAuthenticated, async (req, res) => {
    try {
        const centers = await Center.findByUserId(req.userId);
        res.render('centers/compare', { centers });
    } catch (err) {
        res.status(500).render('error', { error: 'Error al obtener los centros para comparar' });
    }
});

// Crear nuevo centro
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const centerData = {
            ...req.body,
            user_id: req.userId
        };
        await Center.create(centerData);
        res.redirect('/centers');
    } catch (err) {
        res.status(500).render('centers/new', { 
            error: 'Error al crear el centro',
            center: req.body
        });
    }
});

// Mostrar detalles de un centro
router.get('/:id', isAuthenticated, checkCenterOwnership, async (req, res) => {
    try {
        const measurements = await Center.getMeasurements(req.params.id);
        res.render('centers/show', { 
            center: req.center,
            measurements
        });
    } catch (err) {
        res.status(500).render('error', { error: 'Error al obtener los detalles del centro' });
    }
});

// Mostrar formulario para editar centro
router.get('/:id/edit', isAuthenticated, checkCenterOwnership, (req, res) => {
    res.render('centers/edit', { center: req.center });
});

// Actualizar centro
router.post('/:id', isAuthenticated, checkCenterOwnership, async (req, res) => {
    try {
        await Center.update(req.params.id, req.body);
        res.redirect(`/centers/${req.params.id}`);
    } catch (err) {
        res.status(500).render('centers/edit', {
            error: 'Error al actualizar el centro',
            center: { ...req.body, id: req.params.id }
        });
    }
});

// Eliminar centro
router.post('/:id/delete', isAuthenticated, checkCenterOwnership, async (req, res) => {
    try {
        await Center.delete(req.params.id);
        res.redirect('/centers');
    } catch (err) {
        res.status(500).render('error', { error: 'Error al eliminar el centro' });
    }
});

// Agregar medición a un centro
router.post('/:id/measurements', isAuthenticated, checkCenterOwnership, async (req, res) => {
    try {
        await Center.addMeasurement(req.params.id, req.body);
        res.redirect(`/centers/${req.params.id}`);
    } catch (err) {
        res.status(500).render('centers/show', {
            error: 'Error al agregar la medición',
            center: req.center,
            measurements: await Center.getMeasurements(req.params.id)
        });
    }
});

// Obtener mediciones de un centro (API)
router.get('/:id/measurements', isAuthenticated, async (req, res) => {
    try {
        const center = await Center.findById(req.params.id);
        if (!center) {
            return res.status(404).json({ error: 'Centro no encontrado' });
        }
        if (center.user_id !== req.userId) {
            return res.status(403).json({ error: 'No autorizado' });
        }
        const measurements = await Center.getMeasurements(req.params.id);
        res.json(measurements);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las mediciones' });
    }
});

module.exports = router; 