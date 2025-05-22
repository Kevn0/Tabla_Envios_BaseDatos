import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Grid,
  TextField,
  Divider
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getCartContents, updateCartItemQuantity, removeFromCart, clearCart } from '../services/cartService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const items = getCartContents();
    setCartItems(items);
    calculateTotal(items);
  }, []);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      const price = typeof item.price === 'string' ? 
        parseInt(item.price.replace(/[^0-9]/g, '')) : 
        item.price;
      return acc + (price * item.cantidad);
    }, 0);
    setTotal(sum);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = updateCartItemQuantity(productId, newQuantity);
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    toast.success('Cantidad actualizada');
  };

  const handleRemoveItem = (productId) => {
    const updatedCart = removeFromCart(productId);
    setCartItems(updatedCart);
    calculateTotal(updatedCart);
    toast.success('Producto eliminado del carrito');
  };

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
    setTotal(0);
    toast.success('Carrito vaciado');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 18, mb: 12 }}>
      <Typography variant="h4" gutterBottom>
        Carrito de Compras
      </Typography>

      {cartItems.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Tu carrito está vacío
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ 
              mt: 2,
              backgroundColor: '#ff0000',
              '&:hover': {
                backgroundColor: '#cc0000'
              }
            }}
          >
            Continuar Comprando
          </Button>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {cartItems.map((item) => (
                <Card key={item._id} sx={{ mb: 2, display: 'flex' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 150, objectFit: 'contain' }}
                    image={item.image || 'https://via.placeholder.com/150'}
                    alt={item.title}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Precio: ${typeof item.price === 'string' ? 
                          parseInt(item.price.replace(/[^0-9]/g, '')).toLocaleString() : 
                          item.price.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleQuantityChange(item._id, item.cantidad - 1)}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.cantidad}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            handleQuantityChange(item._id, value);
                          }
                        }}
                        sx={{ width: 60 }}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                      />
                      <IconButton 
                        size="small"
                        onClick={() => handleQuantityChange(item._id, item.cantidad + 1)}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Resumen del Pedido
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${total.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Envío:</Typography>
                  <Typography>$10,000</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">${(total + 10000).toLocaleString()}</Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCheckout}
                  sx={{
                    mb: 2,
                    backgroundColor: '#ff0000',
                    '&:hover': {
                      backgroundColor: '#cc0000'
                    }
                  }}
                >
                  Proceder al Pago
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearCart}
                  color="error"
                >
                  Vaciar Carrito
                </Button>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default CartPage;
