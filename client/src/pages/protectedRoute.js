
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Make sure you have 'jwt-decode' installed: npm install jwt-decode

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // 1. If no token exists, redirect to login
  if (!token) {
    console.log("No token found, redirecting to login.");
    return <Navigate to="/" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    // 2. Check if the token has expired
    if (decodedToken.exp < currentTime) {
      console.log("Token expired, redirecting to login.");
      // Optional: Clear the expired token from localStorage
      localStorage.removeItem('token');
      return <Navigate to="/" />;
    }

    // 3. If token exists and is valid/not expired, render the children
    return children;

  } catch (error) {
    // 4. If token is malformed or invalid (e.g., not a JWT, syntax error during decode)
    console.error("Error decoding token or token is invalid:", error);
    // Optional: Clear the invalid token from localStorage
    localStorage.removeItem('token');
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;















// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import {jwtDecode} from 'jwt-decode';

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem('token');
//   if (!token) return <Navigate to="/" />;
//   try {
//     jwtDecode(token);
//     return children;
//   } catch {
//     return <Navigate to="/" />;
//   }
// };

// export default ProtectedRoute;
