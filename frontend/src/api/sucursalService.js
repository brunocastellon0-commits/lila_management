// src/api/sucursalService.js - VERSIÓN FINAL OPTIMIZADA
import { fetchAPI } from './config';

const RH_PREFIX = '/rh';

export const sucursalService = {
  /**
   * Obtiene todas las sucursales con manejo robusto de respuestas
   */
  getAllSucursales: async (skip = 0, limit = 100) => {
    try {
      console.log('🏢 [Sucursales] Obteniendo todas las sucursales...');
      
      const data = await fetchAPI(`${RH_PREFIX}/sucursales?skip=${skip}&limit=${limit}`);
      
      console.log('📦 [Sucursales] Datos recibidos:', typeof data, data);
      
      // ✅ Manejo robusto de diferentes formatos de respuesta
      
      // 1. Si es null o undefined, devolver array vacío
      if (data === null || data === undefined) {
        console.warn('⚠️ [Sucursales] Respuesta null/undefined - devolviendo []');
        return [];
      }
      
      // 2. Si ya es un array, devolverlo
      if (Array.isArray(data)) {
        console.log(`✅ [Sucursales] ${data.length} sucursales cargadas`);
        return data;
      }
      
      // 3. Si es un objeto con array en propiedad conocida
      if (data && typeof data === 'object') {
        // Probar diferentes propiedades comunes
        const possibleArrayProps = ['sucursales', 'data', 'items', 'results'];
        
        for (const prop of possibleArrayProps) {
          if (data[prop] && Array.isArray(data[prop])) {
            console.log(`✅ [Sucursales] ${data[prop].length} sucursales desde '${prop}'`);
            return data[prop];
          }
        }
        
        // Si tiene propiedad 'count' o 'total', probablemente es respuesta paginada vacía
        if ('count' in data || 'total' in data) {
          console.log('📊 [Sucursales] Respuesta paginada sin datos');
          return [];
        }
        
        // Si es un objeto único que parece una sucursal, convertirlo a array
        if (data.id || data.nombre_sucursal) {
          console.log('⚠️ [Sucursales] Objeto único detectado, convirtiendo a array');
          return [data];
        }
        
        // Objeto desconocido
        console.warn('⚠️ [Sucursales] Formato de objeto no reconocido:', Object.keys(data));
        return [];
      }
      
      // 4. Cualquier otro tipo (string, number, etc.)
      console.warn('⚠️ [Sucursales] Tipo de respuesta inesperado:', typeof data);
      return [];
      
    } catch (error) {
      console.error('❌ [Sucursales] Error:', error);
      
      // Mensajes de error más específicos según el tipo
      if (error.status === 404) {
        throw new Error('Endpoint /rh/sucursales no encontrado. Verifica la configuración del gateway.');
      }
      
      if (error.status === 500) {
        throw new Error('Error interno del servidor al obtener sucursales. Contacta al administrador.');
      }
      
      if (error.isConnectionError) {
        throw new Error('No se puede conectar con el servidor. Verifica que el backend esté ejecutándose.');
      }
      
      // Error genérico
      throw new Error(`Error al cargar sucursales: ${error.message}`);
    }
  },

  /**
   * Obtiene una sucursal por ID
   */
  getSucursalById: async (sucursalId) => {
    try {
      // Validación de entrada
      const id = parseInt(sucursalId);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID de sucursal inválido');
      }

      console.log(`🏢 [Sucursales] Obteniendo sucursal ID: ${id}`);

      const data = await fetchAPI(`${RH_PREFIX}/sucursales/${id}`);
      
      // Validar respuesta
      if (!data || typeof data !== 'object') {
        throw new Error(`Sucursal ${id} no encontrada`);
      }
      
      console.log(`✅ [Sucursales] Sucursal ${id} obtenida`);
      return data;
      
    } catch (error) {
      console.error(`❌ [Sucursales] Error obteniendo sucursal ${sucursalId}:`, error);
      
      if (error.status === 404) {
        throw new Error(`Sucursal ${sucursalId} no encontrada`);
      }
      
      throw new Error(`Error al obtener sucursal: ${error.message}`);
    }
  },

  /**
   * Crea una nueva sucursal
   */
  createSucursal: async (sucursalData) => {
    try {
      // Validaciones
      if (!sucursalData || typeof sucursalData !== 'object') {
        throw new Error('Datos de sucursal inválidos');
      }

      if (!sucursalData.nombre_sucursal?.trim()) {
        throw new Error('El nombre de la sucursal es requerido');
      }

      if (!sucursalData.ubicacion?.trim()) {
        throw new Error('La ubicación es requerida');
      }

      const payload = {
        nombre_sucursal: sucursalData.nombre_sucursal.trim(),
        ubicacion: sucursalData.ubicacion.trim(),
        telefono: sucursalData.telefono?.trim() || null,
        email: sucursalData.email?.trim() || null,
        horario_apertura: sucursalData.horario_apertura || null,
        horario_cierre: sucursalData.horario_cierre || null
      };

      console.log('🏢 [Sucursales] Creando nueva sucursal:', payload);

      const data = await fetchAPI(`${RH_PREFIX}/sucursales`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!data || typeof data !== 'object') {
        throw new Error('Respuesta inválida del servidor al crear sucursal');
      }

      console.log('✅ [Sucursales] Sucursal creada exitosamente');
      return data;
      
    } catch (error) {
      console.error('❌ [Sucursales] Error creando sucursal:', error);
      
      if (error.status === 409) {
        throw new Error('Ya existe una sucursal con ese nombre');
      }
      
      if (error.status === 400) {
        throw new Error('Datos de sucursal inválidos. Verifica todos los campos.');
      }
      
      throw new Error(`Error al crear sucursal: ${error.message}`);
    }
  },

  /**
   * Actualiza una sucursal existente
   */
  updateSucursal: async (sucursalId, sucursalData) => {
    try {
      const id = parseInt(sucursalId);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID de sucursal inválido');
      }

      if (!sucursalData || typeof sucursalData !== 'object') {
        throw new Error('Datos de sucursal inválidos');
      }

      console.log(`🏢 [Sucursales] Actualizando sucursal ${id}:`, sucursalData);

      const data = await fetchAPI(`${RH_PREFIX}/sucursales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sucursalData)
      });

      if (!data || typeof data !== 'object') {
        throw new Error('Respuesta inválida del servidor al actualizar sucursal');
      }

      console.log(`✅ [Sucursales] Sucursal ${id} actualizada`);
      return data;
      
    } catch (error) {
      console.error(`❌ [Sucursales] Error actualizando sucursal ${sucursalId}:`, error);
      
      if (error.status === 404) {
        throw new Error(`Sucursal ${sucursalId} no encontrada`);
      }
      
      if (error.status === 400) {
        throw new Error('Datos de sucursal inválidos');
      }
      
      throw new Error(`Error al actualizar sucursal: ${error.message}`);
    }
  },

  /**
   * Elimina una sucursal
   */
  deleteSucursal: async (sucursalId) => {
    try {
      const id = parseInt(sucursalId);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID de sucursal inválido');
      }

      console.log(`🏢 [Sucursales] Eliminando sucursal ${id}`);

      await fetchAPI(`${RH_PREFIX}/sucursales/${id}`, {
        method: 'DELETE'
      });

      console.log(`✅ [Sucursales] Sucursal ${id} eliminada`);
      return { success: true, message: 'Sucursal eliminada correctamente' };
      
    } catch (error) {
      console.error(`❌ [Sucursales] Error eliminando sucursal ${sucursalId}:`, error);
      
      if (error.status === 404) {
        throw new Error(`Sucursal ${sucursalId} no encontrada`);
      }
      
      if (error.status === 409) {
        throw new Error('No se puede eliminar: la sucursal tiene empleados asignados');
      }
      
      throw new Error(`Error al eliminar sucursal: ${error.message}`);
    }
  }
};

export default sucursalService;