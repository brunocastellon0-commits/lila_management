// src/services/alertService.js
import { fetchAPI } from '../api/config';

/**
 * Servicio para manejar las alertas del sistema
 * Conecta con HRGatewayService del backend
 */
export const alertService = {
  /**
   * Obtiene todas las alertas pendientes consolidadas
   * Endpoint: GET /rh/alertas/pendientes
   */
  getPendingAlerts: async () => {
    try {
      // ✅ CORRECCIÓN: Incluir el prefijo /rh porque config.js NO lo incluye
      // La API_BASE_URL es http://127.0.0.1:7000/rh
      // Pero estamos quitando ese prefijo del config para ser más flexibles
      const data = await fetchAPI('/rh/alertas/pendientes');
      return data;
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      throw error;
    }
  },

  /**
   * Mapea las alertas del backend al formato del frontend
   */
  mapAlertsToFrontend: (alertas) => {
    return alertas.map(alerta => ({
      id: alerta.id_entidad,
      tipo: alerta.origen.toLowerCase(),
      titulo: getTituloByOrigen(alerta.origen, alerta.prioridad),
      descripcion: alerta.descripcion,
      prioridad: mapPrioridad(alerta.prioridad),
      fecha: alerta.fecha_referencia,
      accion: getAccionByOrigen(alerta.origen)
    }));
  }
};

// Funciones helper privadas
function getTituloByOrigen(origen, prioridad) {
  const titulos = {
    'REQUEST': 'Solicitud Pendiente',
    'SHIFT': 'Turno Sin Cubrir',
    'DOCUMENT': 'Documento Pendiente',
    'TRAINING': 'Capacitación Pendiente',
    'PAYROLL': 'Cierre de Nómina'
  };
  
  return titulos[origen] || 'Alerta';
}

function mapPrioridad(prioridadBackend) {
  const map = {
    'CRITICA': 'Urgente',
    'ALTA': 'Alta',
    'MEDIA': 'Media',
    'BAJA': 'Baja'
  };
  return map[prioridadBackend] || 'Media';
}

function getAccionByOrigen(origen) {
  const acciones = {
    'REQUEST': 'Revisar',
    'SHIFT': 'Asignar',
    'DOCUMENT': 'Aprobar',
    'TRAINING': 'Gestionar',
    'PAYROLL': 'Procesar'
  };
  return acciones[origen] || 'Ver detalles';
}

export default alertService;