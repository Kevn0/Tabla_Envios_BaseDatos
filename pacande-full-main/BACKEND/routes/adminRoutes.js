const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Verifica que el usuario esté logueado
const verifyAdmin = require('../middleware/verifyAdmin'); // Verifica que el usuario tenga rol de admin
const verifySuperAdmin = require('../middleware/verifySuperAdmin');
const {
  obtenerTodosUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  actualizarUsuarioCompleto,
  verificarContraseña
} = require('../controllers/adminController');

// Rutas accesibles por Admin y Superadmin
router.get('/usuarios', verifyToken, verifyAdmin, obtenerTodosUsuarios);
router.get('/usuarios/:id', verifyToken, verifyAdmin, obtenerUsuarioPorId);
router.put('/usuarios/:id', verifyToken, verifyAdmin, actualizarUsuario);
router.post('/verify-password', verifyToken, verifyAdmin, verificarContraseña);

// Rutas solo para usuarios normales (Admin)
router.delete('/eliminar-usuario/:id', verifyToken, verifyAdmin, eliminarUsuario);

// Rutas exclusivas para Superadmin
router.put('/superadmin/usuarios/:id', verifyToken, verifySuperAdmin, actualizarUsuarioCompleto);
router.delete('/superadmin/eliminar-usuario/:id', verifyToken, verifySuperAdmin, eliminarUsuario);

module.exports = router;
