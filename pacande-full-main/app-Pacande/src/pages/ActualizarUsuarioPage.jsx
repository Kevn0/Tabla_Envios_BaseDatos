import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Container,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const ActualizarUsuarioPage = () => {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(id !== "new");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [rol, setRol] = useState("Usuario");
  const navigate = useNavigate();
  const isNewUser = id === "new";

  useEffect(() => {
    const obtenerUsuario = async () => {
      if (isNewUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/admin/usuarios/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        // Si el usuario es admin, redirigir al panel de administración
        if (response.data.rol === "Admin" && localStorage.getItem("rol") !== "Superadmin") {
          toast.error("No se pueden modificar administradores");
          navigate("/admin");
          return;
        }

        setUsuario(response.data);
        setNombre(response.data.nombre);
        setCorreo(response.data.correo);
        setRol(response.data.rol);
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
        toast.error("No se pudo obtener el usuario");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuario();
  }, [id, navigate, isNewUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre || !correo || (isNewUser && !contraseña)) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    try {
      const userData = {
        nombre,
        correo,
        rol,
        ...(contraseña && { contraseña })
      };

      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("rol");
      const baseUrl = "http://localhost:5000/api/admin";

      let url;
      let method;
      
      if (isNewUser) {
        url = "http://localhost:5000/api/auth/registro";
        method = "post";
      } else {
        url = userRole === "Superadmin" 
          ? `${baseUrl}/superadmin/usuarios/${id}`
          : `${baseUrl}/usuarios/${id}`;
        method = "put";
      }

      const response = await axios({
        method,
        url,
        data: userData,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success(isNewUser ? "Usuario creado correctamente" : "Usuario actualizado correctamente");
      setTimeout(() => {
        navigate(userRole === "Superadmin" ? "/superadmin" : "/admin");
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.mensaje || `Error al ${isNewUser ? 'crear' : 'actualizar'} el usuario`;
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 18, mb: 12 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 18, mb: 12 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {isNewUser ? "Crear Nuevo Usuario" : "Actualizar Usuario"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </Box>

        <Box mb={2}>
          <TextField
            label="Correo"
            variant="outlined"
            fullWidth
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </Box>

        <Box mb={2}>
          <TextField
            label={isNewUser ? "Contraseña" : "Nueva Contraseña"}
            type="password"
            variant="outlined"
            fullWidth
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required={isNewUser}
            helperText={!isNewUser && "Dejar vacío si no deseas cambiar la contraseña"}
          />
        </Box>

        {localStorage.getItem("rol") === "Superadmin" && (
          <Box mb={2}>
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={rol}
                label="Rol"
                onChange={(e) => setRol(e.target.value)}
                required
              >
                <MenuItem value="Usuario">Usuario</MenuItem>
                <MenuItem value="Admin">Administrador</MenuItem>
                <MenuItem value="Superadmin">Super Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="contained" color="primary" type="submit">
            {isNewUser ? "Crear Usuario" : "Actualizar Usuario"}
          </Button>
        </Box>
      </form>
      <ToastContainer />
    </Container>
  );
};

export default ActualizarUsuarioPage;
