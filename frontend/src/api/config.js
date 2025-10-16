// src/api/config.js
// Configuración base de la API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Función helper para hacer peticiones fetch con manejo de errores
 */
export const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Si la respuesta no es OK, lanzar error con detalles
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    throw error;
  }
};

export default API_BASE_URL;