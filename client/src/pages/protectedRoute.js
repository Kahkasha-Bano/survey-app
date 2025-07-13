import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  try {
    jwtDecode(token);
    return children;
  } catch {
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
