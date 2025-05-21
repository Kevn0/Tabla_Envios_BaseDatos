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

export const getAllShipments = async () => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response;
  } catch (error) {
    console.error("Error en getAllShipments:", error.response || error);
    throw error;
  }
};

export const createShipment = async (data) => {
  try {
    const response = await axios.post(API_URL, data, getAuthConfig());
    return response;
  } catch (error) {
    console.error("Error en createShipment:", error.response || error);
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
