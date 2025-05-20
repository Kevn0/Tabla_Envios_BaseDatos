// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const connectDB = require("./config/db");
connectDB();

// Rutas
app.get("/", (req, res) => {
  res.send("Backend de Pacandé funcionando 🎉");
});

// Rutas de usuarios
const userRoutes = require("./routes/authRoutes");
app.use("/api/auth", userRoutes);

// Rutas de productos
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// Rutas de administradores (si tienes un archivo separado)
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Envíos
const shipmentRoutes = require("./routes/shipmentRoutes");
app.use("/api/shipments", shipmentRoutes);
