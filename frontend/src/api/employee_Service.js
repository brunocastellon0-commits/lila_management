// src/services/employeeService.js
import { fetchAPI } from '../api/config';

/**
 * Servicio para manejar operaciones de empleados
 * Todos los endpoints pasan por el Gateway (puerto 7000) que redirige al microservicio de RRHH (puerto 8001)
 * 
 * Rutas:
 * Frontend → Gateway (7000) → Microservicio RRHH (8001)
 * GET /rh/employees → GET /employees (en el microservicio)
 */

// Prefijo del microservicio en el gateway
const RH_PREFIX = '/rh';

export const employeeService = {
  /**
   * Obtiene todos los empleados
   * @param {number} skip - Número de registros a saltar (paginación)
   * @param {number} limit - Número máximo de registros a retornar
   * @returns {Promise<Array>} Lista de empleados
   */
  getAllEmployees: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchAPI(`${RH_PREFIX}/employees?skip=${skip}&limit=${limit}`);
      return data;
    } catch (error) {
      console.error('Error obteniendo empleados:', error);
      throw error;
    }
  },

  /**
   * Obtiene un empleado por ID
   * @param {number} employeeId - ID del empleado
   * @returns {Promise<Object>} Datos del empleado
   */
  getEmployeeById: async (employeeId) => {
    try {
      const data = await fetchAPI(`${RH_PREFIX}/employees/${employeeId}`);
      return data;
    } catch (error) {
      console.error(`Error obteniendo empleado ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo empleado
   * ✅ CORRECCIÓN: Sin barra al final
   * @param {Object} employeeData - Datos del empleado (según EmployeeCreate schema)
   * @returns {Promise<Object>} Empleado creado con su ID
   */
  createEmployee: async (employeeData) => {
    try {
      const data = await fetchAPI(`${RH_PREFIX}/employees`, {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });
      return data;
    } catch (error) {
      console.error('Error creando empleado:', error);
      throw error;
    }
  },
    createEmployeeWithUser: async (employeeData) => {
    try {
      const data = await fetchAPI(`${RH_PREFIX}/employees-with-user`, {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });
      return data;
    } catch (error) {
      console.error('Error creando empleado con usuario:', error);
      throw error;
    }
  },

  /**
   * Actualiza un empleado existente
   * @param {number} employeeId - ID del empleado
   * @param {Object} employeeData - Datos a actualizar (según EmployeeUpdate schema)
   * @returns {Promise<Object>} Empleado actualizado
   */
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const data = await fetchAPI(`${RH_PREFIX}/employees/${employeeId}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData)
      });
      return data;
    } catch (error) {
      console.error(`Error actualizando empleado ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un empleado
   * @param {number} employeeId - ID del empleado a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  deleteEmployee: async (employeeId) => {
    try {
      const data = await fetchAPI(`${RH_PREFIX}/employees/${employeeId}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error(`Error eliminando empleado ${employeeId}:`, error);
      throw error;
    }
  }
};

export default employeeService;