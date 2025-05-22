import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { toast } from "react-hot-toast";

const AdminProductosPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    imageUrl: "",
  });
  const [subcategories, setSubcategories] = useState([]);
  const navigate = useNavigate();

  const categories = [
    { _id: "1", name: "Ropa" },
    { _id: "2", name: "Tecnología" },
    { _id: "3", name: "Hogar" },
    { _id: "4", name: "Deporte" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (!token || (rol !== "Admin" && rol !== "Superadmin")) {
      navigate("/");
      return;
    }

    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products/products");
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setLoading(false);
    }
  };

  const handleEditProduct = async (product) => {
    setEditProduct({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory,
      imageUrl: product.imageUrl
    });
    updateSubcategories(product.category);
    setOpenEditDialog(true);
  };

  const updateSubcategories = (category) => {
    if (category === "Ropa") {
      setSubcategories(["Hombre", "Mujer", "Niños"]);
    } else if (category === "Tecnología") {
      setSubcategories(["Computadoras", "Celulares", "Accesorios"]);
    } else if (category === "Hogar") {
      setSubcategories(["Muebles", "Decoración", "Jardin"]);
    } else if (category === "Deporte") {
      setSubcategories(["Fútbol", "Básquetbol", "variedad"]);
    } else {
      setSubcategories([]);
    }
  };

  const handleCategoryChange = (e, isNewProduct = false) => {
    const selectedCategory = e.target.value;
    const target = isNewProduct ? setNewProduct : setEditProduct;
    
    target(prev => ({
      ...prev,
      category: selectedCategory,
      subcategory: "",
    }));

    updateSubcategories(selectedCategory);
  };

  const handleCreateProduct = async () => {
    try {
      await axios.post("http://localhost:5000/api/products/products/create", newProduct);
      fetchProducts();
      setOpenCreateDialog(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      if (!editProduct._id) {
        toast.error("ID de producto no válido");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/products/products/${editProduct._id}`,
        editProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Producto actualizado exitosamente");
        setOpenEditDialog(false);
        fetchProducts();
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      toast.error(error.response?.data?.mensaje || "Error al actualizar el producto");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/products/products/${productToDelete._id}`
      );
      fetchProducts();
      setOpenDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 18, mb: 12 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Gestión de Productos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{
            backgroundColor: '#ff0000',
            '&:hover': {
              backgroundColor: '#cc0000'
            }
          }}
        >
          Crear Producto
        </Button>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid xs={12} sm={6} md={4} key={product._id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }
            }}>
              <Box sx={{ 
                position: 'relative',
                paddingTop: '75%', // 4:3 Aspect Ratio
                backgroundColor: '#f5f5f5'
              }}>
                <Box
                  component="img"
                  src={product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={product.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom component="div" noWrap>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1
                }}>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${product.price}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={product.category}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={product.subcategory}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <IconButton
                  onClick={() => handleEditProduct(product)}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setProductToDelete(product);
                    setOpenDeleteDialog(true);
                  }}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de Eliminación */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              component="img"
              src={productToDelete?.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'}
              alt={productToDelete?.name}
              sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
            />
            <Box>
              <Typography variant="h6">{productToDelete?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {productToDelete?.description}
              </Typography>
            </Box>
          </Box>
          <Typography color="error">
            ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteProduct} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Edición */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 2, textAlign: 'center' }}>
            <Box
              component="img"
              src={editProduct?.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'}
              alt={editProduct?.name}
              sx={{ 
                width: '200px', 
                height: '200px', 
                objectFit: 'cover',
                borderRadius: 1,
                mb: 2
              }}
            />
          </Box>
          <TextField
            fullWidth
            label="Nombre"
            value={editProduct?.name || ""}
            onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descripción"
            value={editProduct?.description || ""}
            onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Precio"
            type="number"
            value={editProduct?.price || ""}
            onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <span>$</span>
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoría</InputLabel>
            <Select
              value={editProduct?.category || ""}
              label="Categoría"
              onChange={(e) => handleCategoryChange(e)}
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Subcategoría</InputLabel>
            <Select
              value={editProduct?.subcategory || ""}
              label="Subcategoría"
              onChange={(e) => setEditProduct({ ...editProduct, subcategory: e.target.value })}
            >
              {subcategories.map((subcategory) => (
                <MenuItem key={subcategory} value={subcategory}>
                  {subcategory}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="URL de la imagen"
            value={editProduct?.imageUrl || ""}
            onChange={(e) => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
            margin="normal"
            helperText="Ingresa la URL de la imagen del producto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Creación */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Producto</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 2, textAlign: 'center' }}>
            <Box
              component="img"
              src={newProduct.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'}
              alt="Vista previa"
              sx={{ 
                width: '200px', 
                height: '200px', 
                objectFit: 'cover',
                borderRadius: 1,
                mb: 2
              }}
            />
          </Box>
          <TextField
            fullWidth
            label="Nombre"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descripción"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Precio"
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <span>$</span>
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoría</InputLabel>
            <Select
              value={newProduct.category}
              label="Categoría"
              onChange={(e) => handleCategoryChange(e, true)}
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Subcategoría</InputLabel>
            <Select
              value={newProduct.subcategory}
              label="Subcategoría"
              onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
            >
              {subcategories.map((subcategory, index) => (
                <MenuItem key={index} value={subcategory}>
                  {subcategory}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="URL de la imagen"
            value={newProduct.imageUrl}
            onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
            margin="normal"
            helperText="Ingresa la URL de la imagen del producto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateProduct} color="primary" variant="contained">
            Crear Producto
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProductosPage; 