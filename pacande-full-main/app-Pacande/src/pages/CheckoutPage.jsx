import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getCartContents, clearCart } from '../services/cartService';
import { createShipment } from '../services/shipmentService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const [shippingData, setShippingData] = useState({
    direccionEnvio: '',
    ciudad: '',
    departamento: '',
    telefono: '',
    notasAdicionales: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Por favor inicia sesión para continuar');
      navigate('/login');
      return;
    }

    const items = getCartContents();
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      navigate('/cart');
      return;
    }

    setCartItems(items);
    calculateTotal(items);
  }, [navigate]);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      const price = typeof item.price === 'string' ? 
        parseInt(item.price.replace(/[^0-9]/g, '')) : 
        item.price;
      return acc + (price * item.cantidad);
    }, 0);
    setTotal(sum);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePaymentData = () => {
    if (paymentMethod === 'card') {
      // Validar número de tarjeta (Luhn algorithm)
      const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardNumber)) {
        toast.error('El número de tarjeta debe tener 16 dígitos');
        return false;
      }

      // Validar nombre del titular
      if (!/^[a-zA-Z\s]{3,}$/.test(paymentData.cardHolder)) {
        toast.error('Ingrese un nombre de titular válido');
        return false;
      }

      // Validar fecha de expiración (MM/YY)
      const [month, year] = paymentData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (!month || !year || 
          parseInt(month) < 1 || parseInt(month) > 12 || 
          parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        toast.error('Fecha de expiración inválida');
        return false;
      }

      // Validar CVV
      if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        toast.error('CVV inválido');
        return false;
      }

      // Simular validación con procesador de pagos
      const hasBalance = Math.random() > 0.1; // 90% de probabilidad de tener fondos
      if (!hasBalance) {
        toast.error('Tarjeta rechazada: fondos insuficientes');
        return false;
      }
    } else if (!paymentMethod) {
      toast.error('Seleccione un método de pago');
      return false;
    }
    return true;
  };

  const validateShippingData = () => {
    if (!shippingData.direccionEnvio || !shippingData.ciudad || !shippingData.departamento || !shippingData.telefono) {
      toast.error('Complete todos los datos de envío');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Por favor inicia sesión para realizar la compra');
      navigate('/login');
      return;
    }
    
    if (!validateShippingData()) {
      return;
    }

    if (!validatePaymentData()) {
      return;
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const shipmentData = {
        cliente: userId,
        direccionEnvio: `${shippingData.direccionEnvio}, ${shippingData.ciudad}, ${shippingData.departamento}`,
        telefono: shippingData.telefono,
        productos: cartItems.map(item => ({
          producto: item._id,
          cantidad: item.cantidad,
          precio: parseInt(typeof item.price === 'string' ? item.price.replace(/[^0-9]/g, '') : item.price)
        })),
        costoEnvio: 10000,
        notasAdicionales: shippingData.notasAdicionales,
        metodoPago: paymentMethod,
        estado: 'pendiente',
        fechaEnvio: new Date()
      };

      const response = await createShipment(shipmentData);
      
      if (response) {
        clearCart();
        toast.success('¡Pedido realizado con éxito! Puedes ver el estado de tu envío en "Mis Envíos"');
        navigate('/mis-envios');
      }
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      toast.error('Error al procesar el pedido. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 18, mb: 12 }}>
      <Typography variant="h4" gutterBottom>
        Finalizar Compra
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Datos de Envío
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dirección de Envío"
                      name="direccionEnvio"
                      value={shippingData.direccionEnvio}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ciudad"
                      name="ciudad"
                      value={shippingData.ciudad}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Departamento"
                      name="departamento"
                      value={shippingData.departamento}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono"
                      value={shippingData.telefono}
                      onChange={handleShippingChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notas Adicionales"
                      name="notasAdicionales"
                      value={shippingData.notasAdicionales}
                      onChange={handleShippingChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Método de Pago
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Método de Pago</InputLabel>
                      <Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        label="Método de Pago"
                      >
                        <MenuItem value="card">Tarjeta de Crédito/Débito</MenuItem>
                        <MenuItem value="cash">Efectivo contra entrega</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {paymentMethod === 'card' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Número de Tarjeta"
                          name="cardNumber"
                          value={paymentData.cardNumber}
                          onChange={handlePaymentChange}
                          required
                          inputProps={{ maxLength: 16 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Titular de la Tarjeta"
                          name="cardHolder"
                          value={paymentData.cardHolder}
                          onChange={handlePaymentChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Fecha de Expiración (MM/YY)"
                          name="expiryDate"
                          value={paymentData.expiryDate}
                          onChange={handlePaymentChange}
                          required
                          inputProps={{ maxLength: 5 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="CVV"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={handlePaymentChange}
                          required
                          type="password"
                          inputProps={{ maxLength: 4 }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: '2rem' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen del Pedido
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {cartItems.map((item) => (
                    <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.title} x {item.cantidad}
                      </Typography>
                      <Typography variant="body2">
                        ${(parseInt(typeof item.price === 'string' ? 
                          item.price.replace(/[^0-9]/g, '') : 
                          item.price) * item.cantidad).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${total.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Envío:</Typography>
                  <Typography>$10,000</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">${(total + 10000).toLocaleString()}</Typography>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    backgroundColor: '#ff0000',
                    '&:hover': {
                      backgroundColor: '#cc0000'
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      Procesando...
                    </>
                  ) : (
                    'Confirmar Pedido'
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default CheckoutPage; 