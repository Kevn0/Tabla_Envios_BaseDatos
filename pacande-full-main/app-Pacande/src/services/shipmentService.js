import axios from "axios";

const API_URL = "http://localhost:5000/api/shipments";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Validar que el ID sea un ObjectId válido de MongoDB
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

export const getShipmentsByUser = async (userId) => {
  // Validar userId
  if (!userId) {
    throw new Error("Se requiere ID de usuario");
  }

  if (!isValidObjectId(userId)) {
    throw new Error(`ID de usuario no válido: ${userId}`);
  }

  try {
    console.log(`Realizando petición GET a ${API_URL}?cliente=${userId}`);
    const config = getAuthConfig();
    console.log("Configuración de la petición:", {
      url: `${API_URL}?cliente=${userId}`,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization.substring(0, 20) + '...'
      }
    });

    const response = await axios.get(`${API_URL}?cliente=${userId}`, config);
    
    if (!response.data) {
      throw new Error("No se recibieron datos del servidor");
    }

    console.log("Respuesta exitosa:", {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'No es un array'
    });

    return response;
  } catch (error) {
    console.error("Error en getShipmentsByUser:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getAllShipments = async (userId = null) => {
  try {
    const config = getAuthConfig();
    const url = userId ? `${API_URL}?cliente=${userId}` : API_URL;
    const response = await axios.get(url, config);
    return response;
  } catch (error) {
    console.error("Error en getAllShipments:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const createShipment = async (data) => {
  try {
    // Validate required fields
    if (!data.cliente || !data.direccionEnvio || !data.productos || !data.costoEnvio) {
      throw new Error("Faltan campos requeridos para crear el envío");
    }

    // Validate client ID format
    if (!isValidObjectId(data.cliente)) {
      throw new Error("ID de cliente no válido");
    }

    // Validate productos array
    if (!Array.isArray(data.productos) || data.productos.length === 0) {
      throw new Error("La lista de productos no puede estar vacía");
    }

    // Validate each product ID and quantity
    for (const item of data.productos) {
      if (!isValidObjectId(item.producto)) {
        throw new Error(`ID de producto no válido: ${item.producto}`);
      }
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        throw new Error(`Cantidad no válida para el producto ${item.producto}`);
      }
    }

    const response = await axios.post(API_URL, data, getAuthConfig());
    return response;
  } catch (error) {
    if (error.response) {
      console.error("Error en createShipment:", {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error("Error en createShipment:", error.message);
    }
    throw error;
  }
};

export const updateShipmentStatus = async (id, estado) => {
  if (!isValidObjectId(id)) {
    throw new Error("ID de envío no válido");
  }

  try {
    const response = await axios.put(`${API_URL}/${id}`, { estado }, getAuthConfig());
    return response;
  } catch (error) {
    console.error("Error en updateShipmentStatus:", error.response || error);
    throw error;
  }
};
