const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, actualizarPerfil, obtenerPerfil, cambiarContrasena } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken'); 

// Rutas públicas
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);

// Rutas protegidas
router.get('/perfil', verifyToken, obtenerPerfil);
router.put('/actualizar', verifyToken, actualizarPerfil);
router.put('/cambiar-contrasena', verifyToken, cambiarContrasena);

module.exports = router;
