// models/User.js
const mongoose = require('mongoose');

const ROLES = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Admin',
  USUARIO: 'Usuario'
};

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true, select: false },
  profilePicture: { type: String },
  rol: { 
    type: String, 
    enum: Object.values(ROLES),
    default: ROLES.USUARIO 
  }
}, { timestamps: true }); 

module.exports = {
  User: mongoose.model('User', userSchema),
  ROLES
};
