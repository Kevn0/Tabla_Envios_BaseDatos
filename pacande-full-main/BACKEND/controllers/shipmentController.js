// controllers/shipmentController.js
const Shipment = require("../models/shipmentModel");
const mongoose = require("mongoose");

// Crear nuevo envío
exports.createShipment = async (req, res) => {
  try {
    const shipmentData = req.body;
    
    // Validar que los productos y costoEnvio existan
    if (!shipmentData.productos || !Array.isArray(shipmentData.productos) || shipmentData.productos.length === 0) {
      throw new Error("No hay productos en el envío");
    }
    if (typeof shipmentData.costoEnvio !== 'number') {
      throw new Error("El costo de envío debe ser un número");
    }

    // Calcular el total de los productos
    console.log("Productos recibidos:", shipmentData.productos);
    const productosTotal = shipmentData.productos.reduce((acc, producto) => {
      console.log("Procesando producto:", producto);
      const precio = Number(producto.precio);
      const cantidad = Number(producto.cantidad);
      
      if (isNaN(precio) || isNaN(cantidad)) {
        throw new Error(`Precio o cantidad inválidos para el producto ${producto.producto}`);
      }
      
      const subtotal = precio * cantidad;
      console.log(`Subtotal para producto ${producto.producto}: ${subtotal}`);
      return acc + subtotal;
    }, 0);

    console.log("Total de productos:", productosTotal);
    console.log("Costo de envío:", shipmentData.costoEnvio);

    // Agregar el costo de envío al total
    shipmentData.total = productosTotal + shipmentData.costoEnvio;
    console.log("Total final:", shipmentData.total);

    const shipment = new Shipment(shipmentData);
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
    
    let query = {};
    
    // Si hay un cliente específico en la query, filtrar por ese cliente
    if (cliente) {
      if (!mongoose.Types.ObjectId.isValid(cliente)) {
        return res.status(400).json({
          message: "ID de cliente no válido",
          receivedId: cliente
        });
      }
      query.cliente = new mongoose.Types.ObjectId(cliente);
    }

    const envios = await Shipment.find(query)
      .populate("cliente", "nombre correo")
      .populate("productos.producto", "nombre precio")
      .sort({ fechaEnvio: -1 }); // Ordenar por fecha, más recientes primero

    console.log(`Se encontraron ${envios.length} envíos${cliente ? ` para el cliente ${cliente}` : ''}`);

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
