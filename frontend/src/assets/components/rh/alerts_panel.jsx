import React, { useState, useEffect } from "react";
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import alertService from "../../../api/alert_service.js";

const AlertsPanel = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar alertas al montar el componente
  useEffect(() => {
    loadAlertas();
    // Recargar cada 5 minutos
    const interval = setInterval(loadAlertas, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const data = await alertService.getPendingAlerts();
      const alertasMapeadas = alertService.mapAlertsToFrontend(data);
      setAlertas(alertasMapeadas);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando alertas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Separar alertas en importantes y actividad reciente
  const alertasImportantes = alertas.filter(a => 
    a.prioridad === 'Urgente' || a.prioridad === 'Alta'
  ).slice(0, 4);

  const actividadReciente = alertas.slice(0, 4).map(a => ({
    activityType: getActivityType(a.prioridad),
    activityTitle: a.titulo,
    activityDescription: a.descripcion,
    activityTime: formatFecha(a.fecha),
    activityIcon: getIconByType(a.tipo)
  }));

  const activityTypeStyles = {
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    critical: "bg-red-100 text-red-600",
    info: "bg-turquoise-100 text-turquoise-600",
  };

  const alertTypeStyles = {
    critical: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    info: "bg-turquoise-50 border-turquoise-200 text-turquoise-800",
  };

  const priorityBadgeStyles = {
    Urgente: "bg-red-100 text-red-800",
    Alta: "bg-yellow-100 text-yellow-800",
    Media: "bg-turquoise-100 text-turquoise-800",
    Baja: "bg-gray-100 text-gray-800",
  };

  if (loading && alertas.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">Cargando alertas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-600 mb-4">Error al cargar alertas: {error}</p>
        <Button onClick={loadAlertas} variant="outline" size="sm">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Actividad Reciente */}
      <Card className="bg-white border border-turquoise-200 shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-turquoise-600">
              <Clock className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription className="text-sm text-turquoise-700">
              Últimas actualizaciones del sistema
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-turquoise-600 hover:text-turquoise-700"
            onClick={loadAlertas}
          >
            Actualizar
          </Button>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actividadReciente.map((activity, index) => {
            const Icon = activity.activityIcon;
            return (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-3 rounded-lg ${activityTypeStyles[activity.activityType]} hover:brightness-95 transition`}
              >
                <div className="p-2 rounded-full bg-current text-white flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.activityTitle}</p>
                  <p className="text-xs mt-1 line-clamp-2">{activity.activityDescription}</p>
                  <p className="text-xs mt-1 font-medium">{activity.activityTime}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Alertas Importantes */}
      <Card className="bg-white border border-turquoise-200 shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Alertas Importantes
          </CardTitle>
          <Badge className="bg-yellow-100 text-yellow-800">
            {alertasImportantes.length}
          </Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alertasImportantes.length > 0 ? (
            alertasImportantes.map((alert, index) => (
              <div 
                key={index} 
                className={`flex flex-col gap-2 p-4 rounded-lg border ${alertTypeStyles[getAlertType(alert.prioridad)]} hover:shadow-md transition`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{alert.titulo}</p>
                  <Badge className={`text-xs font-semibold ${priorityBadgeStyles[alert.prioridad]}`}>
                    {alert.prioridad}
                  </Badge>
                </div>
                <p className="text-xs line-clamp-2">{alert.descripcion}</p>
                <Button variant="outline" size="sm" className="text-xs">
                  {alert.accion}
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No hay alertas importantes en este momento
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de Personal */}
      <Card className="bg-gradient-to-br from-turquoise-50 to-turquoise-100 border border-turquoise-200">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-turquoise-500 text-white flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-semibold text-turquoise-900">Estado del Personal</h3>
              <p className="text-sm text-turquoise-700 mt-1">
                Información actualizada del sistema
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-turquoise-800">
                <span>• {alertas.length} alertas activas</span>
                <span>• {alertasImportantes.length} requieren atención</span>
                <span>• Sistema operativo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Funciones helper
function getActivityType(prioridad) {
  const map = {
    'Urgente': 'critical',
    'Alta': 'warning',
    'Media': 'info',
    'Baja': 'success'
  };
  return map[prioridad] || 'info';
}

function getAlertType(prioridad) {
  const map = {
    'Urgente': 'critical',
    'Alta': 'warning',
    'Media': 'info',
    'Baja': 'info'
  };
  return map[prioridad] || 'info';
}

function getIconByType(tipo) {
  const icons = {
    'request': Calendar,
    'shift': Clock,
    'document': FileText,
    'training': FileText,
    'payroll': CheckCircle
  };
  return icons[tipo] || AlertTriangle;
}

function formatFecha(fecha) {
  if (!fecha) return 'Hace un momento';
  const date = new Date(fecha);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default AlertsPanel;