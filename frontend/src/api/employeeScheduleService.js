// src/services/employeeScheduleService.js - CORREGIDO
import { fetchAPI } from '../api/config';

const RH_PREFIX = '/rh';

export const employeeScheduleService = {
  /**
   * Obtiene todos los patrones de horario
   */
  getAllSchedules: async (skip = 0, limit = 100) => {
    try {
      // ✅ CORRECCIÓN: Usar /schedules en lugar de /employee-schedules
      const data = await fetchAPI(`${RH_PREFIX}/schedules?skip=${skip}&limit=${limit}`);
      
      if (!Array.isArray(data)) {
        console.warn('La respuesta de horarios no es un array:', data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      
      if (error.status === 404) {
        throw new Error('Endpoint de horarios no encontrado. Verifica la configuración del gateway.');
      }
      
      throw new Error(`Error al cargar horarios: ${error.message}`);
    }
  },

  /**
   * Obtiene los horarios de un empleado específico
   */
  getSchedulesByEmployeeId: async (employeeId) => {
    try {
      if (!employeeId || isNaN(employeeId)) {
        throw new Error('ID de empleado inválido');
      }

      // ✅ CORRECCIÓN: Filtrar por employee_id en el endpoint /schedules
      const data = await fetchAPI(`${RH_PREFIX}/schedules?employee_id=${employeeId}`);
      
      if (!Array.isArray(data)) {
        console.warn('La respuesta de horarios por empleado no es un array:', data);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error(`Error obteniendo horarios del empleado ${employeeId}:`, error);
      throw new Error(`Error al cargar horarios del empleado: ${error.message}`);
    }
  },

  /**
   * Crea un nuevo patrón de horario
   */
  createSchedule: async (scheduleData) => {
    try {
      // Validaciones básicas
      if (!scheduleData.employee_id || !scheduleData.nombre_horario || 
          !scheduleData.dia_semana || !scheduleData.hora_inicio_patron || 
          !scheduleData.hora_fin_patron) {
        throw new Error('Faltan campos requeridos para crear el horario');
      }

      // Asegurar tipos correctos
      const payload = {
        employee_id: parseInt(scheduleData.employee_id),
        nombre_horario: scheduleData.nombre_horario.trim(),
        dia_semana: parseInt(scheduleData.dia_semana),
        hora_inicio_patron: scheduleData.hora_inicio_patron,
        hora_fin_patron: scheduleData.hora_fin_patron,
        es_actual: scheduleData.es_actual !== undefined ? scheduleData.es_actual : true
      };

      // Validar rango de día de semana (1-7)
      if (payload.dia_semana < 1 || payload.dia_semana > 7) {
        throw new Error('El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo)');
      }

      // ✅ CORRECCIÓN: Usar /schedules en lugar de /employee-schedules
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
        throw new Error('Datos inválidos para crear horario: ' + (error.detail || error.message));
      } else if (error.status === 404) {
        throw new Error('Empleado no encontrado');
      } else if (error.status === 409) {
        throw new Error('Ya existe un horario similar para este empleado');
      }
      
      throw new Error(`Error al crear horario: ${error.message}`);
    }
  },

  /**
   * Actualiza un patrón de horario existente
   */
  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      if (!scheduleId || isNaN(scheduleId)) {
        throw new Error('ID de horario inválido');
      }

      // Preparar payload solo con campos definidos
      const payload = {};
      
      if (scheduleData.employee_id !== undefined) {
        payload.employee_id = parseInt(scheduleData.employee_id);
      }
      if (scheduleData.nombre_horario !== undefined) {
        payload.nombre_horario = scheduleData.nombre_horario.trim();
      }
      if (scheduleData.dia_semana !== undefined) {
        payload.dia_semana = parseInt(scheduleData.dia_semana);
        
        if (payload.dia_semana < 1 || payload.dia_semana > 7) {
          throw new Error('El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo)');
        }
      }
      if (scheduleData.hora_inicio_patron !== undefined) {
        payload.hora_inicio_patron = scheduleData.hora_inicio_patron;
      }
      if (scheduleData.hora_fin_patron !== undefined) {
        payload.hora_fin_patron = scheduleData.hora_fin_patron;
      }
      if (scheduleData.es_actual !== undefined) {
        payload.es_actual = scheduleData.es_actual;
      }

      if (Object.keys(payload).length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      // ✅ CORRECCIÓN: Usar /schedules en lugar de /employee-schedules
      const data = await fetchAPI(`${RH_PREFIX}/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      return data;
    } catch (error) {
      console.error(`Error actualizando horario ${scheduleId}:`, error);
      
      if (error.status === 404) {
        throw new Error(`Horario ${scheduleId} no encontrado`);
      }
      
      throw new Error(`Error al actualizar horario: ${error.message}`);
    }
  },

  /**
   * Elimina un patrón de horario existente
   */
  deleteSchedule: async (scheduleId) => {
    try {
      if (!scheduleId || isNaN(scheduleId)) {
        throw new Error('ID de horario inválido');
      }

      // ✅ CORRECCIÓN: Usar /schedules en lugar de /employee-schedules
      const data = await fetchAPI(`${RH_PREFIX}/schedules/${scheduleId}`, {
        method: 'DELETE'
      });

      return data;
    } catch (error) {
      console.error(`Error eliminando horario ${scheduleId}:`, error);
      
      if (error.status === 404) {
        throw new Error(`Horario ${scheduleId} no encontrado`);
      }
      
      throw new Error(`Error al eliminar horario: ${error.message}`);
    }
  },

  /**
   * Obtiene un patrón de horario específico por su ID
   */
  getScheduleById: async (scheduleId) => {
    try {
      if (!scheduleId || isNaN(scheduleId)) {
        throw new Error('ID de horario inválido');
      }

      // ✅ CORRECCIÓN: Usar /schedules en lugar de /employee-schedules
      const data = await fetchAPI(`${RH_PREFIX}/schedules/${scheduleId}`);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Respuesta inválida del servidor');
      }
      
      return data;
    } catch (error) {
      console.error(`Error obteniendo horario ${scheduleId}:`, error);
      
      if (error.status === 404) {
        throw new Error(`Horario ${scheduleId} no encontrado`);
      }
      
      throw new Error(`Error al cargar horario: ${error.message}`);
    }
  },

  /**
   * Crea múltiples horarios para todos los días de la semana
   */
  createSchedulesForAllDays: async (baseData) => {
    try {
      const diasSemana = [
        { value: 1, label: "Lunes" },
        { value: 2, label: "Martes" },
        { value: 3, label: "Miércoles" },
        { value: 4, label: "Jueves" },
        { value: 5, label: "Viernes" },
        { value: 6, label: "Sábado" },
        { value: 7, label: "Domingo" }
      ];

      const promises = diasSemana.map(dia => {
        const scheduleData = {
          employee_id: baseData.employee_id,
          nombre_horario: `${baseData.nombre_base} - ${dia.label}`,
          dia_semana: dia.value,
          hora_inicio_patron: baseData.hora_inicio_patron,
          hora_fin_patron: baseData.hora_fin_patron,
          es_actual: baseData.es_actual
        };
        
        return employeeScheduleService.createSchedule(scheduleData);
      });

      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').map(result => result.value);
      const failed = results.filter(result => result.status === 'rejected');
      
      if (failed.length > 0) {
        console.warn(`${failed.length} horarios no pudieron crearse:`, failed);
      }
      
      return {
        successful,
        failed: failed.map(f => f.reason),
        totalCreated: successful.length,
        totalFailed: failed.length
      };
    } catch (error) {
      console.error('Error creando horarios para todos los días:', error);
      throw new Error(`Error al crear horarios múltiples: ${error.message}`);
    }
  }
};

export default employeeScheduleService;