// src/services/statsService.js
import { fetchAPI } from '../api/config';

/**
 * Servicio para manejar las estadísticas y métricas del dashboard
 * Conecta con HRGatewayService del backend
 */
export const statsService = {
  /**
   * Obtiene el resumen de estadísticas consolidadas
   * Endpoint: GET /rh/stats/resumen
   */
  getResumenStats: async () => {
    try {
      const data = await fetchAPI('/api/rh/stats/resumen');
      return data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  /**
   * Mapea las stats del backend al formato del frontend para QuickStats
   */
  mapStatsToQuickStats: (stats) => {
    return [
      {
        label: 'Total Empleados',
        value: stats.total_activos?.toString() || '0',
        change: {
          value: '+3 este mes', // Puedes calcular esto del backend si envías datos históricos
          trend: 'up'
        },
        status: 'good'
      },
      {
        label: 'Turnos Hoy',
        value: stats.turnos_cubiertos_hoy?.toString() || '0',
        change: {
          value: `${stats.turnos_sin_cubrir || 0} pendientes`,
          trend: stats.turnos_sin_cubrir > 0 ? 'down' : 'neutral'
        },
        status: stats.turnos_sin_cubrir > 0 ? 'warning' : 'good'
      },
      {
        label: 'Capacitaciones',
        value: stats.capacitaciones_activas?.toString() || '0',
        change: {
          value: `${stats.capacitaciones_pendientes || 0} pendientes`,
          trend: stats.capacitaciones_pendientes > 3 ? 'down' : 'neutral'
        },
        status: stats.capacitaciones_pendientes > 3 ? 'warning' : 'good'
      },
      {
        label: 'Cumplimiento',
        value: `${stats.cumplimiento_porcentaje || 94}%`,
        change: {
          value: '+2% vs mes anterior',
          trend: 'up'
        },
        status: stats.cumplimiento_porcentaje >= 90 ? 'good' : 'warning'
      }
    ];
  }
};

export default statsService;