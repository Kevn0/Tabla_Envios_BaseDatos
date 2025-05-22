// middleware/verifyAdmin.js
const { ROLES } = require('../models/User');

const verifyAdmin = (req, res, next) => {
  if (!req.usuario || (req.usuario.rol !== ROLES.ADMIN && req.usuario.rol !== ROLES.SUPERADMIN)) {
    return res.status(403).json({ msg: 'Acceso solo para administradores' });
  }

  next();
};

module.exports = verifyAdmin;
  