// src/services/authService.js
import axios from 'axios';

const API_URL = "http://localhost:5000/api/auth"; // Cambia si usas otra ruta

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/registro`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    // Validar la estructura de la respuesta
    const { data } = response;
    if (!data.token || !data.usuario || !data.usuario._id) {
      throw new Error("Respuesta del servidor incompleta");
    }

    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
