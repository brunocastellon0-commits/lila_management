// src/services/employeeScheduleService.js - SIMPLIFICADO
import { fetchAPI } from '../api/config';

const RH_PREFIX = '/rh';

export const employeeScheduleService = {
  /**
   * Obtiene horarios con filtros
   */
  getSchedules: async (filters = {}) => {
    try {
      const { employee_id, sucursal_id, skip = 0, limit = 100 } = filters;
      
      let url = `${RH_PREFIX}/schedules?skip=${skip}&limit=${limit}`;
      
      if (employee_id) url += `&employee_id=${employee_id}`;
      if (sucursal_id) url += `&sucursal_id=${sucursal_id}`;

      console.log('🔍 Fetching URL:', url); // Para debug
      
      const data = await fetchAPI(url);
      
      if (!Array.isArray(data)) {
        console.warn('La respuesta de horarios no es un array:', data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      throw new Error(`Error al cargar horarios: ${error.message}`);
    }
  },

  /**
   * Obtiene horarios por sucursal
   */
  getSchedulesBySucursalId: async (sucursalId) => {
    try {
      return await employeeScheduleService.getSchedules({ sucursal_id: sucursalId });
    } catch (error) {
      console.error(`Error obteniendo horarios de sucursal ${sucursalId}:`, error);
      throw new Error(`Error al cargar horarios de la sucursal: ${error.message}`);
    }
  },

  /**
   * Crea un nuevo patrón de horario
   */
  createSchedule: async (scheduleData) => {
    try {
      // Validaciones básicas
      if (!scheduleData.employee_id || !scheduleData.sucursal_id || 
          !scheduleData.nombre_horario || !scheduleData.dias_semana?.length || 
          !scheduleData.hora_inicio_patron || !scheduleData.hora_fin_patron) {
        throw new Error('Faltan campos requeridos para crear el horario');
      }

      const payload = {
        employee_id: parseInt(scheduleData.employee_id),
        sucursal_id: parseInt(scheduleData.sucursal_id),
        nombre_horario: scheduleData.nombre_horario.trim(),
        dias_semana: scheduleData.dias_semana,
        hora_inicio_patron: scheduleData.hora_inicio_patron,
        hora_fin_patron: scheduleData.hora_fin_patron,
        es_actual: scheduleData.es_actual !== undefined ? scheduleData.es_actual : true,
        descripcion: scheduleData.descripcion || null
      };

      console.log('📤 Enviando payload:', payload); // Para debug

      const data = await fetchAPI(`${RH_PREFIX}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      return data;
    } catch (error) {
      console.error('Error creando horario:', error);
      
      if (error.status === 400) {
        throw new Error('Datos inválidos para crear horario');
      } else if (error.status === 404) {
        throw new Error('Empleado o sucursal no encontrado');
      } else if (error.status === 409) {
        throw new Error('Ya existe un horario similar para este empleado');
      }
      
      throw new Error(`Error al crear horario: ${error.message}`);
    }
  },

  /**
   * Elimina un horario
   */
  deleteSchedule: async (scheduleId) => {
    try {
      if (!scheduleId || isNaN(scheduleId)) {
        throw new Error('ID de horario inválido');
      }

      await fetchAPI(`${RH_PREFIX}/schedules/${scheduleId}`, {
        method: 'DELETE'
      });

      return { success: true, message: 'Horario eliminado correctamente' };
    } catch (error) {
      console.error(`Error eliminando horario ${scheduleId}:`, error);
      
      if (error.status === 404) {
        throw new Error(`Horario ${scheduleId} no encontrado`);
      }
      
      throw new Error(`Error al eliminar horario: ${error.message}`);
    }
  }
};

export default employeeScheduleService;