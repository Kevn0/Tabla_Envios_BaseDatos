// src/services/authService.js

const API_URL = "http://localhost:5000/api/auth"; // Cambia si usas otra ruta

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al registrar usuario");
    }

    return data;
  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    console.log("Intentando login con credenciales:", {
      correo: credentials.correo,
      contraseña: '***'
    });

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log("Respuesta completa del servidor:", data);

    if (!response.ok) {
      throw new Error(data.message || "Error al iniciar sesión");
    }

    // Validar que la respuesta tenga la estructura esperada
    if (!data.token || !data.usuario || !data.usuario.id) {
      console.error("Respuesta del servidor incompleta:", data);
      throw new Error("La respuesta del servidor no tiene el formato esperado");
    }

    return data;
  } catch (error) {
    console.error("Error en loginUser:", error);
    throw error;
  }
};
