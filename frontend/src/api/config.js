// src/api/config.js
// Configuración base de la API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:7000';

/**
 * Función helper para hacer peticiones fetch con manejo de errores
 */
export const fetchAPI = async (endpoint, options = {}) => {
  try {
    // ✅ CORRECCIÓN: Manejar correctamente las URLs con/sin barra final
    const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const url = `${cleanBase}${cleanEndpoint}`;

    console.log(`🔄 Haciendo petición a: ${url}`);

    const response = await fetch(url, { 
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      // ✅ CORRECCIÓN: No seguir redirects automáticamente
      redirect: 'manual'
    });

    // ✅ CORRECCIÓN: Manejar redirects manualmente
    if (response.status === 307 || response.status === 308) {
      // Obtener la ubicación de redirección
      const redirectUrl = response.headers.get('Location');
      if (redirectUrl) {
        console.log(`🔄 Redirect 307 a: ${redirectUrl}`);
        // Hacer la petición a la URL de redirección
        const redirectResponse = await fetch(redirectUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options
        });
        
        if (!redirectResponse.ok) {
          await handleErrorResponse(redirectResponse);
        }
        
        if (redirectResponse.status === 204) {
          return {};
        }
        
        const responseText = await redirectResponse.text();
        return responseText ? JSON.parse(responseText) : {};
      }
    }

    // Si la respuesta no es OK, lanzar error con detalles
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    // Devolver un objeto vacío si la respuesta es 204 No Content
    if (response.status === 204) {
      return {};
    }

    // Para otras respuestas, parsear como JSON
    const responseText = await response.text();
    
    if (!responseText) {
      return {};
    }
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(`No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en ${API_BASE_URL}`);
    }
    
    throw error;
  }
};

// ✅ CORRECCIÓN: Función auxiliar para manejar errores
async function handleErrorResponse(response) {
  let errorDetail;
  
  try {
    const errorText = await response.text();
    
    if (errorText) {
      try {
        const errorData = JSON.parse(errorText);
        errorDetail = errorData.detail || errorData.message || errorText;
      } catch {
        errorDetail = errorText;
      }
    } else {
      errorDetail = `Error HTTP: ${response.status} ${response.statusText}`;
    }
  } catch (parseError) {
    errorDetail = `Error HTTP: ${response.status} ${response.statusText}`;
  }
  
  const error = new Error(errorDetail);
  error.status = response.status;
  error.statusText = response.statusText;
  throw error;
}

export default API_BASE_URL;