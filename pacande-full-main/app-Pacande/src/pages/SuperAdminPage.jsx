import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Container,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { FaUsersCog, FaBoxOpen, FaTruck, FaUserPlus } from "react-icons/fa";

const ActionButton = styled.div`
  background-color: ${props => props.isRed ? '#ff0000' : '#000000'};
  color: white;
  padding: 15px;
  border-radius: 10px;
  margin: 10px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(10px);
    background-color: ${props => props.isRed ? '#cc0000' : '#333333'};
  }

  svg {
    font-size: 24px;
  }
`;

const SuperAdminPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [editForm, setEditForm] = useState({
    nombre: "",
    correo: "",
    rol: "",
    contraseña: "",
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Añadir estos estilos personalizados
  const tableStyles = {
    headerCell: {
      backgroundColor: '#000000',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: '#333333',
      }
    },
    sortIcon: {
      marginLeft: '5px',
      fontSize: '0.8rem'
    },
    actionButton: {
      margin: '0 5px',
      textTransform: 'none',
      minWidth: '100px'
    },
    sortingControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      backgroundColor: '#f5f5f5',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    tableContainer: {
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    tableRow: {
      '&:nth-of-type(odd)': {
        backgroundColor: '#f9f9f9'
      },
      '&:hover': {
        backgroundColor: '#f0f0f0'
      },
      transition: 'background-color 0.3s ease'
    }
  };

  // Función para ordenar usuarios
  const sortUsers = (users, config) => {
    const roleHierarchy = {
      'Superadmin': 1,
      'Admin': 2,
      'Usuario': 3
    };

    const sortedUsers = [...users].sort((a, b) => {
      if (config.key === 'createdAt') {
        const dateA = new Date(a[config.key]);
        const dateB = new Date(b[config.key]);
        return config.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (config.key === 'nombre') {
        return config.direction === 'asc' 
          ? a[config.key].localeCompare(b[config.key])
          : b[config.key].localeCompare(a[config.key]);
      }

      if (config.key === 'rol') {
        const roleValueA = roleHierarchy[a[config.key]];
        const roleValueB = roleHierarchy[b[config.key]];
        return config.direction === 'asc'
          ? roleValueA - roleValueB
          : roleValueB - roleValueA;
      }

      return config.direction === 'asc'
        ? a[config.key] > b[config.key] ? 1 : -1
        : b[config.key] > a[config.key] ? 1 : -1;
    });
    return sortedUsers;
  };

  // Función para manejar el cambio de ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setUsuarios(sortUsers(usuarios, { key, direction }));
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (!token || rol !== "Superadmin") {
      toast.error("Acceso no autorizado");
      navigate("/");
      return;
    }

    const obtenerUsuarios = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/usuarios",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        if (error.response?.status === 403) {
          toast.error("No tienes permisos para ver esta página");
          navigate("/");
          return;
        }
        toast.error("Error al cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuarios();
  }, [navigate]);

  const handleEditClick = (usuario) => {
    setUserToEdit(usuario);
    setEditForm({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      contraseña: "",
    });
    setPendingAction('edit');
    setOpenPasswordDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUserId = localStorage.getItem("userId");
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      // Validaciones básicas
      if (!editForm.nombre || !editForm.correo || !editForm.rol) {
        toast.error("Por favor complete todos los campos obligatorios");
        return;
      }

      const updatedUser = {
        nombre: editForm.nombre,
        correo: editForm.correo,
        rol: editForm.rol
      };

      // Solo incluir contraseña si se proporcionó una nueva
      if (editForm.contraseña) {
        updatedUser.contraseña = editForm.contraseña;
      }

      const response = await axios.put(
        `http://localhost:5000/api/admin/superadmin/usuarios/${userToEdit._id}`,
        updatedUser,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Actualizar la lista de usuarios
        setUsuarios(usuarios.map((u) =>
          u._id === userToEdit._id
            ? { ...u, ...updatedUser }
            : u
        ));

        toast.success("Usuario actualizado correctamente");
        setOpenEditDialog(false);

        // Si el servidor indica que se requiere cerrar sesión
        if (response.data.requireLogout) {
          toast.info("El rol del usuario ha sido cambiado. Se cerrará la sesión en 3 segundos...");
          setTimeout(() => {
            localStorage.clear();
            window.location.href = "/";
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      const errorMessage = error.response?.data?.mensaje || "Error al actualizar el usuario";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (usuario) => {
    setUserToDelete(usuario);
    setPendingAction('delete');
    setOpenPasswordDialog(true);
  };

  const handlePasswordConfirm = async () => {
    try {
      // Verificar la contraseña del admin
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/admin/verify-password",
        { contraseña: adminPassword },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.valid) {
        setOpenPasswordDialog(false);
        setAdminPassword("");
        
        if (pendingAction === 'edit') {
          setOpenEditDialog(true);
        } else if (pendingAction === 'delete') {
          setOpenDialog(true);
        }
      } else {
        toast.error("Contraseña incorrecta");
      }
    } catch (error) {
      console.error("Error al verificar contraseña:", error);
      toast.error("Error al verificar la contraseña");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/eliminar-usuario/${userToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUsuarios(usuarios.filter((u) => u._id !== userToDelete._id));
      toast.success("Usuario eliminado correctamente");
      setOpenDialog(false);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error al eliminar el usuario");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const isUsersPage = location.pathname === "/superadmin";

  return (
    <Container maxWidth="lg" sx={{ mt: 18, mb: 12 }}>
      {!isUsersPage && (
        <>
          <Typography variant="h4" align="center" gutterBottom>
            Panel de Super Administración
          </Typography>

          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <ActionButton isRed onClick={() => navigate("/superadmin")}>
              <FaUsersCog />
              <span>Gestionar Usuarios</span>
            </ActionButton>

            <ActionButton onClick={() => navigate("/admin/productos")}>
              <FaBoxOpen />
              <span>Gestionar Productos</span>
            </ActionButton>

            <ActionButton onClick={() => navigate("/admin/envios")}>
              <FaTruck />
              <span>Gestionar Envíos</span>
            </ActionButton>
          </Box>
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: isUsersPage ? 0 : 6, mb: 3 }}>
        <Typography variant="h5">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaUserPlus />}
          onClick={() => navigate("/admin/actualizar-usuario/new")}
          sx={{
            backgroundColor: '#000000',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        >
          Crear Usuario
        </Button>
      </Box>

      <Box sx={tableStyles.sortingControls}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortConfig.key}
            label="Ordenar por"
            onChange={(e) => handleSort(e.target.value)}
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              }
            }}
          >
            <MenuItem value="createdAt">Fecha de creación</MenuItem>
            <MenuItem value="nombre">Nombre</MenuItem>
            <MenuItem value="rol">Rol</MenuItem>
            <MenuItem value="correo">Correo</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => handleSort(sortConfig.key)}
          sx={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
          startIcon={sortConfig.direction === 'asc' ? '↑' : '↓'}
        >
          {sortConfig.direction === 'asc' ? 'Ascendente' : 'Descendente'}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={tableStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('nombre')} 
                sx={tableStyles.headerCell}
              >
                Nombre {getSortIcon('nombre')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('correo')} 
                sx={tableStyles.headerCell}
              >
                Correo {getSortIcon('correo')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('rol')} 
                sx={tableStyles.headerCell}
              >
                Rol {getSortIcon('rol')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('createdAt')} 
                sx={tableStyles.headerCell}
              >
                Fecha de Creación {getSortIcon('createdAt')}
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ ...tableStyles.headerCell, cursor: 'default' }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario._id} sx={tableStyles.tableRow}>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.correo}</TableCell>
                <TableCell>
                  <Chip 
                    label={usuario.rol}
                    color={
                      usuario.rol === "Superadmin" ? "error" :
                      usuario.rol === "Admin" ? "primary" : "default"
                    }
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell>
                  {new Date(usuario.createdAt).toLocaleString("es-CO", {
                    timeZone: "America/Bogota",
                  })}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={tableStyles.actionButton}
                    onClick={() => handleEditClick(usuario)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    sx={tableStyles.actionButton}
                    onClick={() => handleDeleteClick(usuario)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de Confirmación de Contraseña */}
      <Dialog open={openPasswordDialog} onClose={() => {
        setOpenPasswordDialog(false);
        setAdminPassword("");
      }}>
        <DialogTitle>Confirmar Contraseña</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Por favor, ingresa tu contraseña para confirmar esta acción.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Contraseña"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenPasswordDialog(false);
            setAdminPassword("");
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePasswordConfirm}
            color="primary"
            disabled={!adminPassword.trim()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar a este usuario?
          {userToDelete?.rol === "Admin" && (
            <Typography color="error" sx={{ mt: 2 }}>
              ¡Advertencia! Estás por eliminar un administrador.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Edición */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={editForm.nombre}
              onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Correo"
              value={editForm.correo}
              onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Rol</InputLabel>
              <Select
                value={editForm.rol}
                label="Rol"
                onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
              >
                <MenuItem value="Usuario">Usuario</MenuItem>
                <MenuItem value="Admin">Administrador</MenuItem>
                <MenuItem value="Superadmin">Super Administrador</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              value={editForm.contraseña}
              onChange={(e) => setEditForm({ ...editForm, contraseña: e.target.value })}
              margin="normal"
              helperText="Dejar en blanco para mantener la contraseña actual"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Container>
  );
};

export default SuperAdminPage; 