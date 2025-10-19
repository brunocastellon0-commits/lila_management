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
      // ✅ CORRECCIÓN: Incluir el prefijo /rh
      const data = await fetchAPI('/rh/stats/resumen');
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
        value: stats.total_employees?.toString() || '0',
        change: {
          value: stats.employees_added_month > 0 
            ? `+${stats.employees_added_month} este mes` 
            : `${stats.employees_added_month || 0} este mes`,
          trend: stats.employees_added_month > 0 ? 'up' : 'neutral'
        },
        status: 'good'
      },
      {
        label: 'Turnos Hoy',
        value: stats.shifts_today?.toString() || '0',
        change: {
          value: `${stats.pending_shifts || 0} pendientes`,
          trend: stats.pending_shifts > 0 ? 'down' : 'neutral'
        },
        status: stats.pending_shifts > 0 ? 'warning' : 'good'
      },
      {
        label: 'Capacitaciones',
        value: stats.active_trainings?.toString() || '0',
        change: {
          value: `${stats.expiring_trainings || 0} vencen pronto`,
          trend: stats.expiring_trainings > 3 ? 'down' : 'neutral'
        },
        status: stats.expiring_trainings > 3 ? 'warning' : 'good'
      },
      {
        label: 'Cumplimiento',
        value: `${stats.compliance_rate || 94}%`,
        change: {
          value: stats.compliance_change >= 0 
            ? `+${stats.compliance_change}% vs mes anterior` 
            : `${stats.compliance_change}% vs mes anterior`,
          trend: stats.compliance_change >= 0 ? 'up' : 'down'
        },
        status: stats.compliance_rate >= 90 ? 'good' : 'warning'
      }
    ];
  }
};

export default statsService;