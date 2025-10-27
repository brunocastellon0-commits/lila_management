// src/api/config.js - VERSIÓN CORREGIDA PARA MANEJAR 307 REDIRECT
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:7000';

/**
 * Función helper para hacer peticiones fetch con manejo robusto de errores y redirects
 */
export const fetchAPI = async (endpoint, options = {}) => {
  try {
    // Construir URL limpia SIN barra final
    const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // ✅ CORRECCIÓN CRÍTICA: Eliminar barras finales para evitar redirect 307
    const finalEndpoint = cleanEndpoint.endsWith('/') && cleanEndpoint !== '/' 
      ? cleanEndpoint.slice(0, -1) 
      : cleanEndpoint;
    
    const url = `${cleanBase}${finalEndpoint}`;

    console.log(`🔄 Petición a: ${url}`, options.method || 'GET');

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      // ✅ CAMBIO: Manual redirect handling para controlar mejor los 307
      redirect: 'manual'
    });

    console.log(`📡 Respuesta: ${response.status} ${response.statusText}`);

    // ✅ NUEVO: Manejar redirects manualmente
    if (response.status === 307 || response.status === 308 || response.status === 301 || response.status === 302) {
      const redirectUrl = response.headers.get('location');
      console.warn(`⚠️ Redirect detectado a: ${redirectUrl}`);
      
      // Si hay una URL de redirect, hacer una nueva petición
      if (redirectUrl) {
        console.log('🔄 Siguiendo redirect...');
        return await fetchAPI(redirectUrl.replace(API_BASE_URL, ''), options);
      }
      
      // Si no hay URL de redirect, tratar como error
      throw new Error(`Redirect sin destino (${response.status}). Verifica la configuración del servidor.`);
    }

    // Manejar errores HTTP
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    // Respuesta 204 No Content
    if (response.status === 204) {
      console.log('📭 Respuesta 204 - No Content');
      return null;
    }

    // Leer el cuerpo de la respuesta
    const responseText = await response.text();
    console.log('📄 Respuesta raw:', responseText.substring(0, 200));
    
    // ✅ Manejar respuestas vacías o null
    if (!responseText || responseText.trim() === '' || responseText === 'null') {
      console.warn('⚠️ Respuesta vacía o null del servidor');
      
      // Para endpoints de listas, devolver array vacío
      if (endpoint.includes('/sucursales') || 
          endpoint.includes('/schedules') || 
          endpoint.includes('/employees') ||
          endpoint.match(/\/(lista|list|all)/i)) {
        console.log('🔄 Devolviendo array vacío para endpoint de lista');
        return [];
      }
      
      // Para otros endpoints, devolver null
      return null;
    }
    
    // Parsear JSON
    try {
      const parsedData = JSON.parse(responseText);
      console.log('✅ Datos parseados correctamente');
      
      // Verificar si el JSON parseado es null
      if (parsedData === null) {
        console.warn('⚠️ JSON parseado es null');
        
        // Para endpoints de listas, devolver array vacío
        if (endpoint.includes('/sucursales') || 
            endpoint.includes('/schedules') || 
            endpoint.includes('/employees')) {
          return [];
        }
        
        return null;
      }
      
      return parsedData;
      
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      console.error('📄 Contenido que falló:', responseText);
      throw new Error(`Respuesta inválida del servidor. Contenido: ${responseText.substring(0, 100)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`, error);
    
    // Error de conexión
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      const detailedError = new Error(
        `No se pudo conectar con el servidor:\n` +
        `• URL: ${API_BASE_URL}\n` +
        `• Endpoint: ${endpoint}\n` +
        `• Verifica que el backend esté ejecutándose\n` +
        `• Verifica la configuración de CORS\n` +
        `• Verifica tu conexión a internet`
      );
      detailedError.isConnectionError = true;
      throw detailedError;
    }
    
    // Si ya es un error estructurado, mantenerlo
    if (error.status || error.isConnectionError) {
      throw error;
    }
    
    // Error genérico
    throw new Error(`Error de red: ${error.message}`);
  }
};

/**
 * Maneja respuestas de error del servidor
 */
async function handleErrorResponse(response) {
  console.error(`❌ Error HTTP ${response.status}: ${response.statusText}`);
  
  let errorDetail = null;
  let errorData = null;
  
  try {
    const errorText = await response.text();
    console.log('📄 Cuerpo del error:', errorText);
    
    if (errorText && errorText.trim() !== '' && errorText !== 'null') {
      try {
        errorData = JSON.parse(errorText);
        errorDetail = errorData.detail || errorData.message || errorData.error || errorText;
      } catch {
        errorDetail = errorText;
      }
    }
  } catch (parseError) {
    console.error('❌ Error leyendo respuesta de error:', parseError);
  }
  
  // Mensajes de error según status code
  const statusMessages = {
    400: 'Solicitud incorrecta - verifica los datos enviados',
    401: 'No autorizado - verifica tus credenciales',
    403: 'Acceso denegado',
    404: 'Recurso no encontrado',
    409: 'Conflicto - el recurso ya existe o hay datos duplicados',
    422: 'Datos no procesables - verifica el formato',
    500: 'Error interno del servidor',
    502: 'Gateway no disponible',
    503: 'Servicio temporalmente no disponible'
  };
  
  const statusMessage = statusMessages[response.status] || `Error HTTP ${response.status}`;
  const finalMessage = errorDetail || statusMessage;
  
  // Crear error estructurado
  const error = new Error(finalMessage);
  error.status = response.status;
  error.statusText = response.statusText;
  error.data = errorData;
  error.url = response.url;
  
  throw error;
}

/**
 * Helper para verificar si el backend está disponible
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default API_BASE_URL;