const { User } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require('path');
const fs = require('fs').promises;

// Registrar usuario
const registrarUsuario = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  console.log(req.body);

  try {
    // Verificar si el usuario ya existe
    let usuarioExistente = await User.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      correo,
      contraseña: contraseñaHasheada,
    });

    // Guardar el usuario en la base de datos
    await nuevoUsuario.save();

    // Responder con éxito y devolver datos del usuario
    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: {
        _id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    });
  } catch (err) {
    // Manejo de errores
    console.error("Error al registrar usuario:", err); // Cambié 'error' por 'err'
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// Login de usuario
const loginUsuario = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    // Buscar usuario y seleccionar campos necesarios
    const usuario = await User.findOne({ correo }).select('+contraseña');
    if (!usuario) {
      return res.status(400).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!passwordValida) {
      return res.status(400).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    // Generar token con _id
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Enviar respuesta con _id
    res.json({
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        profilePicture: usuario.profilePicture
      }
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select("-contraseña"); // Seleccionamos todos los usuarios sin la contraseña
    res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
};

// Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id).select("-contraseña");
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ mensaje: "Error al obtener el perfil" });
  }
};

// Actualizar perfil del usuario
const actualizarPerfil = async (req, res) => {
  const { nombre, correo } = req.body;

  try {
    const usuario = await User.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Actualizar campos básicos
    if (req.body.nombre) usuario.nombre = req.body.nombre;
    if (req.body.correo) usuario.correo = req.body.correo;

    // Manejar la foto de perfil si se proporciona
    if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      
      // Validar el tipo de archivo
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ mensaje: 'Por favor sube una imagen válida' });
      }

      // Validar el tamaño del archivo (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ mensaje: 'La imagen no debe superar los 5MB' });
      }

      // Crear directorio de uploads si no existe
      const uploadDir = path.join(__dirname, '../uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generar nombre de archivo único
      const fileName = `${usuario._id}-${Date.now()}${path.extname(file.name)}`;
      const filePath = path.join(uploadDir, fileName);

      // Eliminar foto anterior si existe
      if (usuario.profilePicture) {
        const oldFilePath = path.join(__dirname, '..', usuario.profilePicture);
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.error('Error al eliminar foto anterior:', err);
        }
      }

      // Guardar nueva foto
      await file.mv(filePath);
      usuario.profilePicture = `/uploads/${fileName}`;
    }

    await usuario.save();

    res.json({
      mensaje: "Perfil actualizado correctamente",
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        profilePicture: usuario.profilePicture
      }
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ mensaje: "Error al actualizar el perfil" });
  }
};

// Cambiar contraseña del usuario
const cambiarContrasena = async (req, res) => {
  const { contrasenaActual, nuevaContrasena } = req.body;

  if (!contrasenaActual || !nuevaContrasena) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  try {
    // Buscar el usuario
    const usuario = await User.findById(req.usuario.id).select('+contraseña');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar la contraseña actual
    const passwordValida = await bcrypt.compare(contrasenaActual, usuario.contraseña);
    if (!passwordValida) {
      return res.status(400).json({ mensaje: 'La contraseña actual es incorrecta' });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.contraseña = await bcrypt.hash(nuevaContrasena, salt);

    // Guardar los cambios
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ mensaje: 'Error al cambiar la contraseña' });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarContrasena,
  obtenerUsuarios,
};
