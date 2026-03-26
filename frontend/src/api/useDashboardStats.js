import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

// Caché a nivel módulo
let globalStatsCache = null;
let globalActivityCache = null;
let globalLastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Hook personalizado para obtener estadísticas del dashboard de RH
 */
export function useDashboardStats() {
  const [stats, setStats] = useState(globalStatsCache || {
    totalEmployees: 0,
    newHires: 0,
    trainingsActive: 0,
    employeeGrowth: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState(globalActivityCache || []);
  const [loading, setLoading] = useState(!globalStatsCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (forceRefresh = false) => {
    if (!forceRefresh && globalStatsCache && (Date.now() - globalLastFetch < CACHE_TTL)) {
      setStats(globalStatsCache);
      setRecentActivity(globalActivityCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch employees
      const employeesResponse = await axios.get(`${API_BASE_URL}/api/rh/employees`);
      const employees = employeesResponse.data;
      
      // Fetch trainings
      const trainingsResponse = await axios.get(`${API_BASE_URL}/api/rh/training`);
      const trainings = trainingsResponse.data;
      
      // Calculate stats
      const today = new Date();
      const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
      
      // Nuevos ingresos en el último mes
      const newHires = employees.filter(emp => {
        const hireDate = new Date(emp.fecha_contratacion);
        return hireDate >= oneMonthAgo;
      }).length;
      
      // Capacitaciones activas (no completadas)
      const activeTrainings = trainings.filter(t => !t.completado).length;
      
      // Calcular crecimiento
      const employeeGrowth = employees.length > 0 ? Math.round((newHires / employees.length) * 100) : 0;
      
      const newStats = {
        totalEmployees: employees.length,
        newHires: newHires,
        trainingsActive: activeTrainings,
        employeeGrowth: employeeGrowth
      };
      
      setStats(newStats);
      globalStatsCache = newStats;
      
      // Generar actividad reciente basada en datos reales
      const activities = [];
      
      // Agregar últimos empleados contratados
      const recentEmployees = employees
        .sort((a, b) => new Date(b.fecha_contratacion) - new Date(a.fecha_contratacion))
        .slice(0, 2);
        
      recentEmployees.forEach(emp => {
        const daysAgo = Math.floor((new Date() - new Date(emp.fecha_contratacion)) / (1000 * 60 * 60 * 24));
        activities.push({
          type: 'hire',
          message: `${emp.nombre} ${emp.apellido_paterno} fue contratado como ${emp.cargo || 'empleado'}`,
          time: daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo} días`,
          color: 'emerald',
          icon: 'check'
        });
      });
      
      // Agregar capacitaciones recientes completadas
      const completedTrainings = trainings
        .filter(t => t.completado)
        .sort((a, b) => new Date(b.fecha_completado || b.fecha_inicio) - new Date(a.fecha_completado || a.fecha_inicio))
        .slice(0, 2);
        
      completedTrainings.forEach(training => {
        activities.push({
          type: 'training',
          message: `Capacitación "${training.nombre_capacitacion}" completada`,
          time: 'Recientemente',
          color: 'blue',
          icon: 'graduation'
        });
      });
      
      // Agregar alertas de documentos pendientes
      try {
        const docsResponse = await axios.get(`${API_BASE_URL}/api/rh/documentos_legales`);
        const docs = docsResponse.data;
        const pendingDocs = docs.filter(d => !d.aprobado_admin).length;
        
        if (pendingDocs > 0) {
          activities.push({
            type: 'alert',
            message: `${pendingDocs} documento(s) legal(es) pendiente(s) de revisión`,
            time: 'Pendiente',
            color: 'amber',
            icon: 'alert'
          });
        }
      } catch (err) {
        console.log('No se pudieron cargar documentos legales');
      }
      
      const finalActivities = activities.slice(0, 5);
      setRecentActivity(finalActivities);
      globalActivityCache = finalActivities;
      globalLastFetch = Date.now();
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    recentActivity,
    loading,
    error,
    refresh: () => fetchDashboardData(true)
  };
}
