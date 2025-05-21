// middleware/verifyAdmin.js

const verifyAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== 'Admin') {
      return res.status(403).json({ msg: 'Acceso solo para administradores' });
    }
  
    next(); // el usuario es admin, permitimos continuar
  };
  
  module.exports = verifyAdmin;
  