import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

let lastVerificationTime = 0;
let isVerifiedStatus = false;

/**
 * Servicio de autenticación para comunicarse con el backend
 */
export const authService = {
  /**
   * Verifica de manera síncrona si hay un token válido en caché
   * @returns {boolean}
   */
  isTokenVerifiedCached() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    // Cache de 5 minutos (300000 ms)
    return isVerifiedStatus && (Date.now() - lastVerificationTime < 300000);
  },

  /**
   * Verifica si el token es válido
   * @returns {Promise<boolean>}
   */
  async verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      isVerifiedStatus = false;
      return false;
    }

    if (this.isTokenVerifiedCached()) {
      return true;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        isVerifiedStatus = true;
        lastVerificationTime = Date.now();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying token:', error);
      isVerifiedStatus = false;
      return false;
    }
  },

  /**
   * Obtiene el usuario actual del localStorage
   * @returns {Object|null}
   */
  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    return {
      id: localStorage.getItem('usuario_id'),
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
      role: localStorage.getItem('role'),
      token: token
    };
  },

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Cierra sesión y limpia el localStorage
   */
  logout() {
    isVerifiedStatus = false;
    lastVerificationTime = 0;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  },

  /**
   * Login del usuario
   * @param {string} identifier - Usuario o email
   * @param {string} password - Contraseña
   * @returns {Promise<Object>}
   */
  async login(identifier, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: identifier.trim(),
        email: identifier.trim().toLowerCase(),
        password
      });

      if (response.data && response.data.user) {
        // Guardar en localStorage
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('usuario_id', response.data.user.id);
        localStorage.setItem('username', response.data.user.username);
        localStorage.setItem('email', response.data.user.email);
        localStorage.setItem('role', response.data.user.role);

        isVerifiedStatus = true;
        lastVerificationTime = Date.now();

        return {
          success: true,
          user: response.data.user,
          token: response.data.access_token
        };
      }

      return { success: false, message: 'Respuesta del servidor inválida' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Error al iniciar sesión'
      };
    }
  }
};
