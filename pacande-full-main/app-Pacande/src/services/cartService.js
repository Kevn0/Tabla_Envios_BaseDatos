import axios from 'axios';

// Obtener el ID del usuario actual
const getUserId = () => {
  return localStorage.getItem('userId');
};

// Obtener la clave del carrito para el usuario actual
const getCartKey = () => {
  const userId = getUserId();
  return userId ? `persistent_cart_${userId}` : null;
};

// Obtener el carrito actual del usuario
const getCart = () => {
  const cartKey = getCartKey();
  if (!cartKey) return [];
  
  const cart = localStorage.getItem(cartKey);
  return cart ? JSON.parse(cart) : [];
};

// Guardar el carrito del usuario
const saveCart = (cart) => {
  const cartKey = getCartKey();
  if (!cartKey) return;
  
  localStorage.setItem(cartKey, JSON.stringify(cart));
};

// Agregar un producto al carrito
export const addToCart = (product) => {
  const userId = getUserId();
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const cart = getCart();
  const existingProductIndex = cart.findIndex(item => item._id === product._id);

  if (existingProductIndex >= 0) {
    // Si el producto ya existe, incrementar la cantidad
    cart[existingProductIndex].cantidad += 1;
  } else {
    // Si es un nuevo producto, agregarlo con cantidad 1
    cart.push({
      _id: product._id,
      title: product.title,
      price: product.price,
      image: product.image,
      cantidad: 1
    });
  }

  saveCart(cart);
  return cart;
};

// Remover un producto del carrito
export const removeFromCart = (productId) => {
  const userId = getUserId();
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const cart = getCart();
  const updatedCart = cart.filter(item => item._id !== productId);
  saveCart(updatedCart);
  return updatedCart;
};

// Actualizar la cantidad de un producto en el carrito
export const updateCartItemQuantity = (productId, cantidad) => {
  const userId = getUserId();
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const cart = getCart();
  const updatedCart = cart.map(item => {
    if (item._id === productId) {
      return { ...item, cantidad: cantidad };
    }
    return item;
  });
  saveCart(updatedCart);
  return updatedCart;
};

// Obtener el contenido del carrito
export const getCartContents = () => {
  const userId = getUserId();
  if (!userId) {
    return [];
  }
  return getCart();
};

// Limpiar el carrito
export const clearCart = () => {
  const cartKey = getCartKey();
  if (!cartKey) return [];
  
  localStorage.removeItem(cartKey);
  return [];
};

// Migrar carrito cuando el usuario inicia sesión
export const migrateCartOnLogin = (userId) => {
  const cart = getCart();
  if (cart.length > 0) {
    // Aquí podrías implementar lógica adicional para sincronizar con el backend si es necesario
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
  }
}; 