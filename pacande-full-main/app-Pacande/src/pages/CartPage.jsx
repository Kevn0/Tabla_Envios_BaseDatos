import React, { useEffect, useState } from "react";
import { createShipment } from "../services/shipmentService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";

const CartContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5em;
  font-weight: 600;
  position: relative;
  
  &:after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, #ff0000, #ff4444);
    margin: 10px auto;
    border-radius: 2px;
  }
`;

const CartTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;

  th {
    background: #000000;
    color: white;
    padding: 15px;
    text-align: left;
    font-weight: 500;
  }

  td {
    padding: 15px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }

  tbody tr:hover {
    background: #f8f9fa;
  }

  tfoot {
    background: #f8f9fa;
    font-weight: 500;

    td {
      padding: 20px 15px;
    }
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  button {
    background: #000000;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #333;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  input {
    width: 60px;
    padding: 4px 8px;
    border: 2px solid #ddd;
    border-radius: 4px;
    text-align: center;
    font-size: 0.9em;

    &:focus {
      outline: none;
      border-color: #ff0000;
    }
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #c82333;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 600px;

  p {
    color: #6c757d;
    margin-bottom: 20px;
  }

  a {
    display: inline-block;
    background: #ff0000;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    text-decoration: none;
    transition: background 0.2s;

    &:hover {
      background: #cc0000;
    }
  }
`;

const AddressInput = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    color: #2c3e50;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 1em;

    &:focus {
      outline: none;
      border-color: #ff0000;
    }
  }
`;

const ConfirmButton = styled.button`
  background: #ff0000;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: block;

  &:hover {
    background: #cc0000;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [direccion, setDireccion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(carritoGuardado);
  }, []);

  const calcularTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Función para calcular el costo de envío basado en cantidad de productos y distancia
  const calcularCostoEnvio = (cart) => {
    const cantidadTotal = cart.reduce((total, item) => total + item.cantidad, 0);
    // Costo base
    let costoBase = 15000;
    
    // Costo adicional por cantidad de productos
    if (cantidadTotal > 5) {
      costoBase += (cantidadTotal - 5) * 1000;
    }
    
    return costoBase;
  };

  const actualizarCantidad = (productId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    const producto = cart.find(item => item._id === productId);
    if (producto && producto.stock < nuevaCantidad) {
      toast.error(`Solo hay ${producto.stock} unidades disponibles`);
      return;
    }

    const nuevoCart = cart.map(item => 
      item._id === productId ? {...item, cantidad: nuevaCantidad} : item
    );
    setCart(nuevoCart);
    localStorage.setItem("cart", JSON.stringify(nuevoCart));
  };

  const eliminarProducto = async (productId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto del carrito?")) {
      const nuevoCart = cart.filter(item => item._id !== productId);
      setCart(nuevoCart);
      localStorage.setItem("cart", JSON.stringify(nuevoCart));
      toast.success("Producto eliminado del carrito");
    }
  };

  const handleBuy = async () => {
    if (!direccion.trim()) {
      toast.error("Por favor ingresa una dirección de envío");
      return;
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Debes iniciar sesión para realizar la compra");
        return;
      }

      // Validar stock antes de procesar la compra
      for (const item of cart) {
        if (item.cantidad > item.stock) {
          toast.error(`No hay suficiente stock de ${item.nombre}`);
          return;
        }
      }

      const costoEnvio = calcularCostoEnvio(cart);
      const totalCompra = calcularTotal();
      
      if (!window.confirm(`
        ¿Confirmas realizar la compra?
        Subtotal: $${totalCompra.toLocaleString()}
        Costo de envío: $${costoEnvio.toLocaleString()}
        Total: $${(totalCompra + costoEnvio).toLocaleString()}
      `)) {
        return;
      }

      const envio = {
        cliente: userId,
        direccionEnvio: direccion,
        productos: cart.map(item => ({
          producto: item._id,
          cantidad: item.cantidad
        })),
        metodoEnvio: "mensajería",
        costoEnvio,
        total: totalCompra + costoEnvio
      };

      await createShipment(envio);
      localStorage.removeItem("cart");
      toast.success("¡Compra realizada con éxito!");
      navigate("/mis-envios");
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la compra");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <CartContainer>
        <Title>Carrito de Compras</Title>
        <EmptyCart>
          <p>No hay productos en el carrito</p>
          <Link to="/">Ir a comprar</Link>
        </EmptyCart>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <Title>Carrito de Compras</Title>
      <CartTable>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Stock</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item._id}>
              <td>{item.nombre}</td>
              <td>${item.precio.toLocaleString()}</td>
              <td>
                <QuantityControl>
                  <button
                    onClick={() => actualizarCantidad(item._id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                  >-</button>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidad(item._id, parseInt(e.target.value))}
                    min="1"
                    max={item.stock}
                  />
                  <button
                    onClick={() => actualizarCantidad(item._id, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                  >+</button>
                </QuantityControl>
              </td>
              <td>
                <span style={{ color: item.cantidad > item.stock ? '#dc3545' : '#2c3e50' }}>
                  {item.stock}
                </span>
              </td>
              <td>${(item.precio * item.cantidad).toLocaleString()}</td>
              <td>
                <DeleteButton onClick={() => eliminarProducto(item._id)}>
                  Eliminar
                </DeleteButton>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" style={{textAlign: 'right'}}><strong>Subtotal:</strong></td>
            <td colSpan="2">${calcularTotal().toLocaleString()}</td>
          </tr>
          <tr>
            <td colSpan="4" style={{textAlign: 'right'}}><strong>Costo de envío:</strong></td>
            <td colSpan="2">${calcularCostoEnvio(cart).toLocaleString()}</td>
          </tr>
          <tr>
            <td colSpan="4" style={{textAlign: 'right'}}><strong>Total:</strong></td>
            <td colSpan="2">${(calcularTotal() + calcularCostoEnvio(cart)).toLocaleString()}</td>
          </tr>
        </tfoot>
      </CartTable>

      <AddressInput>
        <label>Dirección de Envío: *</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ej: Calle 123, Ciudad"
          required
        />
      </AddressInput>

      <ConfirmButton
        onClick={handleBuy}
        disabled={isLoading || !direccion.trim() || cart.length === 0}
      >
        {isLoading ? <div uk-spinner="ratio: 0.8"></div> : "Confirmar compra"}
      </ConfirmButton>
    </CartContainer>
  );
};

export default CartPage;
