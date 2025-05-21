// controllers/shipmentController.js
const Shipment = require("../models/shipmentModel");
const mongoose = require("mongoose");

// Crear nuevo envío
exports.createShipment = async (req, res) => {
  try {
    const shipment = new Shipment(req.body);
    const savedShipment = await shipment.save();
    res.status(201).json(savedShipment);
  } catch (error) {
    console.error("Error al crear envío:", error);
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los envíos
exports.getAllShipments = async (req, res) => {
  try {
    const { cliente } = req.query;
    console.log("Query params recibidos:", req.query);
    console.log("ID de cliente recibido:", cliente);

    // Si no hay cliente en la query, devolver error
    if (!cliente) {
      return res.status(400).json({
        message: "Se requiere el ID del cliente",
        receivedParams: req.query
      });
    }

    // Validar que el ID del cliente sea válido
    if (!mongoose.Types.ObjectId.isValid(cliente)) {
      return res.status(400).json({
        message: "ID de cliente no válido",
        receivedId: cliente
      });
    }

    const clienteId = new mongoose.Types.ObjectId(cliente);
    console.log("Buscando envíos para cliente:", clienteId);

    const envios = await Shipment.find({ cliente: clienteId })
      .populate("cliente", "nombre correo")
      .populate("productos.producto", "nombre precio")
      .sort({ fechaEnvio: -1 }); // Ordenar por fecha, más recientes primero

    console.log(`Se encontraron ${envios.length} envíos para el cliente ${cliente}`);

    res.json(envios);
  } catch (error) {
    console.error("Error al obtener envíos:", error);
    res.status(500).json({
      message: "Error al obtener los envíos",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener envío por ID
exports.getShipmentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de envío no válido" });
    }

    const shipment = await Shipment.findById(req.params.id)
      .populate("cliente", "nombre correo")
      .populate("productos.producto", "nombre precio");

    if (!shipment) {
      return res.status(404).json({ message: "Envío no encontrado" });
    }

    res.json(shipment);
  } catch (error) {
    console.error("Error al obtener envío por ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar estado del envío
exports.updateShipmentStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de envío no válido" });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { estado: req.body.estado },
      { new: true }
    ).populate("cliente productos.producto");

    if (!shipment) {
      return res.status(404).json({ message: "Envío no encontrado" });
    }

    res.json(shipment);
  } catch (error) {
    console.error("Error al actualizar estado del envío:", error);
    res.status(400).json({ error: error.message });
  }
};

// Eliminar envío
exports.deleteShipment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de envío no válido" });
    }

    const shipment = await Shipment.findByIdAndDelete(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: "Envío no encontrado" });
    }

    res.json({ message: "Envío eliminado correctamente", shipment });
  } catch (error) {
    console.error("Error al eliminar envío:", error);
    res.status(500).json({ error: error.message });
  }
};
