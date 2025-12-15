import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

/**
 * Servicio para gestionar la comunicación con el backend de cumplimiento legal
 * Endpoint: /api/rh/documentos_legales
 */
export const complianceService = {
  /**
   * Obtiene todos los documentos legales del restaurante
   * @returns {Promise<Array>} Lista de documentos (licencias, permisos, etc.)
   */
  async getDocuments() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rh/documentos_legales`);
      return response.data;
    } catch (error) {
      console.error('Error fetching compliance documents:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo documento legal asociado a un empleado
   * @param {number} employeeId - ID del empleado
   * @param {Object} documentData - Datos del documento {tipo, url_archivo, fecha_vencimiento, aprobado_admin}
   * @returns {Promise<Object>} Documento creado
   */
  async createDocument(employeeId, documentData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/rh/documents/employees/${employeeId}/documents`,
        documentData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating compliance document:', error);
      throw error;
    }
  },

  /**
   * Actualiza un documento existente
   * @param {number} id - ID del documento
   * @param {FormData} formData - Datos actualizados
   * @returns {Promise<Object>} Documento actualizado
   */
  async updateDocument(id, formData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/rh/documentos_legales/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating compliance document:', error);
      throw error;
    }
  },

  /**
   * Elimina un documento
   * @param {number} id - ID del documento a eliminar
   * @returns {Promise<void>}
   */
  async deleteDocument(id) {
    try {
      await axios.delete(`${API_BASE_URL}/api/rh/documentos_legales/${id}`);
    } catch (error) {
      console.error('Error deleting compliance document:', error);
      throw error;
    }
  },

  /**
   * Aprueba o rechaza un documento (solo admin)
   * @param {number} id - ID del documento
   * @param {boolean} aprobado - Estado de aprobación
   * @returns {Promise<Object>} Documento actualizado
   */
  async approveDocument(id, aprobado) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/rh/documentos_legales/${id}/aprobar`,
        { aprobado_admin: aprobado }
      );
      return response.data;
    } catch (error) {
      console.error('Error approving compliance document:', error);
      throw error;
    }
  },
};