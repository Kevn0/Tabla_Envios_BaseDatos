const { ROLES } = require('../models/User');

const verifySuperAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== ROLES.SUPERADMIN) {
    return res.status(403).json({ msg: 'Acceso solo para super administradores' });
  }

  next();
};

module.exports = verifySuperAdmin; 