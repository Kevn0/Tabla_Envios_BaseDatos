import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import { createShipment } from '../services/shipmentService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PurchaseDialog = ({ open, onClose, product }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    direccionEnvio: '',
    ciudad: '',
    departamento: '',
    telefono: '',
    notasAdicionales: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
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
      // Validar número de tarjeta
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
    if (!formData.direccionEnvio || !formData.ciudad || !formData.departamento || !formData.telefono) {
      toast.error('Complete todos los datos de envío');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateShippingData()) {
      return;
    }

    if (!validatePaymentData()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!product?._id) {
        throw new Error('ID de producto no disponible');
      }

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        toast.error('Por favor inicia sesión para realizar una compra');
        navigate('/login');
        return;
      }

      const precio = parseInt(typeof product.price === 'string' ? 
        product.price.replace(/[^0-9]/g, '') : 
        product.price);

      const shipmentData = {
        cliente: userId,
        direccionEnvio: `${formData.direccionEnvio}, ${formData.ciudad}, ${formData.departamento}`,
        telefono: formData.telefono,
        productos: [{
          producto: product._id,
          cantidad: 1,
          precio: precio
        }],
        costoEnvio: 10000,
        notasAdicionales: formData.notasAdicionales,
        metodoPago: paymentMethod,
        estado: 'pendiente',
        fechaEnvio: new Date()
      };

      const response = await createShipment(shipmentData);

      toast.success('¡Compra realizada con éxito! Puedes ver el estado de tu envío en "Mis Envíos"');
      onClose();
      // Limpiar el formulario
      setFormData({
        direccionEnvio: '',
        ciudad: '',
        departamento: '',
        telefono: '',
        notasAdicionales: ''
      });
      setPaymentMethod('');
      setPaymentData({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
      });
      // Redirigir a la página de envíos
      setTimeout(() => {
        navigate('/mis-envios');
      }, 2000);
    } catch (error) {
      console.error('Error detallado:', error);
      let errorMessage = 'Error al procesar la compra';
      
      if (error.message === 'ID de producto no disponible') {
        errorMessage = 'Error: No se pudo identificar el producto. Por favor, intenta de nuevo.';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        toast.error('Por favor inicia sesión para realizar una compra');
        onClose();
        navigate('/login');
      }
    }
  }, [open, navigate]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Finalizar Compra</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Producto: {product?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Precio: ${product?.price?.toLocaleString()}
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Datos de Envío
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección de Envío"
                name="direccionEnvio"
                value={formData.direccionEnvio}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas Adicionales"
                name="notasAdicionales"
                value={formData.notasAdicionales}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, mb: 2 }}>
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
          </Box>

          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Subtotal:</Typography>
            <Typography>
              ${parseInt(typeof product?.price === 'string' ? 
                product?.price.replace(/[^0-9]/g, '') : 
                product?.price).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Envío:</Typography>
            <Typography>$10,000</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">
              ${(parseInt(typeof product?.price === 'string' ? 
                product?.price.replace(/[^0-9]/g, '') : 
                product?.price) + 10000).toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting}
            sx={{
              backgroundColor: '#ff0000',
              '&:hover': {
                backgroundColor: '#cc0000'
              }
            }}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Procesando...
              </>
            ) : (
              'Confirmar Compra'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PurchaseDialog; 