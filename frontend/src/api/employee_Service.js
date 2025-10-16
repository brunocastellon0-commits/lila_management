// src/services/employeeService.js
import { fetchAPI } from '../api/config';

/**
 * Servicio para manejar operaciones de empleados
 */
export const employeeService = {
  /**
   * Obtiene todos los empleados
   */
  getAllEmployees: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchAPI(`/api/employees?skip=${skip}&limit=${limit}`);
      return data;
    } catch (error) {
      console.error('Error obteniendo empleados:', error);
      throw error;
    }
  },

  /**
   * Obtiene un empleado por ID
   */
  getEmployeeById: async (employeeId) => {
    try {
      const data = await fetchAPI(`/api/employees/${employeeId}`);
      return data;
    } catch (error) {
      console.error(`Error obteniendo empleado ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Crea un nuevo empleado
   */
  createEmployee: async (employeeData) => {
    try {
      const data = await fetchAPI('/api/employees', {
        method: 'POST',
        body: JSON.stringify(employeeData)
      });
      return data;
    } catch (error) {
      console.error('Error creando empleado:', error);
      throw error;
    }
  },

  /**
   * Actualiza un empleado existente
   */
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const data = await fetchAPI(`/api/employees/${employeeId}`, {
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
   */
  deleteEmployee: async (employeeId) => {
    try {
      const data = await fetchAPI(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error(`Error eliminando empleado ${employeeId}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene cargos disponibles
   */
  getCargos: async () => {
    try {
      const data = await fetchAPI('/api/cargos');
      return data;
    } catch (error) {
      console.error('Error obteniendo cargos:', error);
      throw error;
    }
  },

  /**
   * Obtiene sucursales disponibles
   */
  getSucursales: async () => {
    try {
      const data = await fetchAPI('/api/sucursales');
      return data;
    } catch (error) {
      console.error('Error obteniendo sucursales:', error);
      throw error;
    }
  }
};

export default employeeService;