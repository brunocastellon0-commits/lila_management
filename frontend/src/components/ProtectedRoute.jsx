import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { Loader2 } from 'lucide-react';

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
export function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = verificando, true/false = resultado
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    verifyAuthentication();
  }, []);

  const verifyAuthentication = async () => {
    // Primero verificamos si hay token en localStorage
    if (!authService.isAuthenticated()) {
      setIsAuthenticated(false);
      setIsVerifying(false);
      return;
    }

    // Verificamos que el token sea válido con el backend
    try {
      const isValid = await authService.verifyToken();
      setIsAuthenticated(isValid);
      
      if (!isValid) {
        // Si el token no es válido, limpiamos el localStorage
        authService.logout();
      }
    } catch (error) {
      console.error('Error verifying authentication:', error);
      setIsAuthenticated(false);
      authService.logout();
    } finally {
      setIsVerifying(false);
    }
  };

  // Mientras verificamos, mostramos un loader
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0c0e12]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#2A9D8F] mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigimos al login
  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostramos el contenido
  return children;
}
