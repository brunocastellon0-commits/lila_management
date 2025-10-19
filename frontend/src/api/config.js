// src/api/config.js
// Configuración base de la API

// ✅ CORRECCIÓN: Remover el prefijo /rh de la base URL
// Los servicios ahora incluirán /rh en sus endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:7000';

/**
 * Función helper para hacer peticiones fetch con manejo de errores
 * Usa un método de concatenación de URL seguro.
 */
export const fetchAPI = async (endpoint, options = {}) => {
  try {
    // Unimos la base URL con el endpoint, asegurando un solo '/' entre ellos
    const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    const url = `${cleanBase}/${cleanEndpoint}`;

    const response = await fetch(url, { 
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Si la respuesta no es OK, lanzar error con detalles
    if (!response.ok) {
      // Intentar parsear el cuerpo para obtener detalles del error (FastAPI suele devolver JSON)
      const errorData = await response.json().catch(() => ({}));
      const errorDetail = errorData.detail || `Error HTTP: ${response.status} ${response.statusText}`;
      throw new Error(errorDetail);
    }
    
    // Devolver un objeto vacío si la respuesta es 204 No Content
    if (response.status === 204) {
      return {};
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error); 
    throw error;
  }
};

export default API_BASE_URL;