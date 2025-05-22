const { User, ROLES } = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Obtener todos los usuarios (sin contraseña)
const obtenerTodosUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select('-contraseña');
    res.json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID no válido' });
    }

    const usuario = await User.findById(id).select('-contraseña');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener el usuario:', error.message);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Actualizar usuario (por admin - limitado)
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contraseña } = req.body;

  try {
    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar que no se intente modificar un admin
    if (usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.SUPERADMIN) {
      return res.status(403).json({ mensaje: 'No tienes permisos para modificar administradores' });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.correo = correo || usuario.correo;

    if (contraseña) {
      const salt = await bcrypt.genSalt(10);
      usuario.contraseña = await bcrypt.hash(contraseña, salt);
    }

    await usuario.save();
    res.json({ mensaje: 'Usuario actualizado correctamente', usuario });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

// Actualizar usuario completo (por superadmin - sin restricciones)
const actualizarUsuarioCompleto = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contraseña, rol } = req.body;

  try {
    // Verificar si el usuario a modificar es el mismo que está haciendo la petición
    if (id === req.usuario.id) {
      return res.status(403).json({ 
        mensaje: 'No puedes modificar tu propio rol' 
      });
    }

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Si el usuario actual es Admin, no permitir cambios de rol
    if (req.usuario.rol === ROLES.ADMIN) {
      return res.status(403).json({ 
        mensaje: 'Los administradores no pueden modificar roles de usuarios' 
      });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.correo = correo || usuario.correo;
    
    // Solo permitir cambios de rol si el usuario actual es SuperAdmin
    if (rol && req.usuario.rol === ROLES.SUPERADMIN) {
      usuario.rol = rol;
    }

    if (contraseña) {
      const salt = await bcrypt.genSalt(10);
      usuario.contraseña = await bcrypt.hash(contraseña, salt);
    }

    await usuario.save();

    // Forzar cierre de sesión si el rol fue cambiado
    const rolCambiado = rol && usuario.rol !== rol;
    
    res.json({ 
      mensaje: 'Usuario actualizado correctamente', 
      usuario,
      requireLogout: rolCambiado 
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Si es una ruta de admin normal, verificar que no se intente eliminar un admin
    if (req.usuario.rol === ROLES.ADMIN) {
      const usuario = await User.findById(id);
      if (usuario && (usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.SUPERADMIN)) {
        return res.status(403).json({ mensaje: 'No tienes permisos para eliminar administradores' });
      }
    }

    const usuarioEliminado = await User.findByIdAndDelete(id);
    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar el usuario:', err);
    res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
  }
};

// Verificar contraseña del administrador
const verificarContraseña = async (req, res) => {
  try {
    const password = req.body.contraseña || req.body.password;
    const userId = req.usuario.id;

    if (!password) {
      return res.status(400).json({ mensaje: 'Contraseña no proporcionada' });
    }

    const usuario = await User.findById(userId).select('+contraseña');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(password, usuario.contraseña);
    res.json({ valid: match });
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    res.status(500).json({ mensaje: 'Error al verificar contraseña' });
  }
};

module.exports = {
  obtenerTodosUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  actualizarUsuarioCompleto,
  eliminarUsuario,
  verificarContraseña
};

