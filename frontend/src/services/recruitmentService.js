// Servicio real de API para reclutamiento
const API_BASE_URL = "http://localhost:7000/api/rh"; // Gateway URL

export const recruitmentService = {
  getAllPostulantes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching postulantes:', error);
      throw error;
    }
  },
  
  createPostulante: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes`, {
        method: 'POST',
        body: formData, // FormData con el archivo PDF
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating postulante:', error);
      throw error;
    }
  },
  
  updatePostulante: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating postulante:', error);
      throw error;
    }
  },
  
  chatWithIA: async (pregunta) => {
    try {
      const response = await fetch(`${API_BASE_URL}/postulantes/chat-rrhh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pregunta }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error chatting with IA:', error);
      return {
        respuesta: "Lo siento, hay un problema de conexión con el asistente. Por favor, intenta de nuevo."
      };
    }
  }
};
