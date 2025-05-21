import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (rol !== "Admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 