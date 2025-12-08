import React, { useState, useEffect } from "react";
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  RefreshCcw,
  Activity
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../ui/card.jsx"; // Asegúrate de que la ruta sea correcta
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import alertService from "../../../api/alert_service.js"; // Asegúrate de que la ruta sea correcta

const AlertsPanel = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar alertas al montar el componente
  useEffect(() => {
    loadAlertas();
    const interval = setInterval(loadAlertas, 300000); // cada 5 min
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
      console.error("Error cargando alertas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Separar alertas
  const alertasImportantes = alertas
    .filter((a) => a.prioridad === "Urgente" || a.prioridad === "Alta")
    .slice(0, 4);

  const actividadReciente = alertas.slice(0, 4).map((a) => ({
    activityType: getActivityType(a.prioridad),
    activityTitle: a.titulo,
    activityDescription: a.descripcion,
    activityTime: formatFecha(a.fecha),
    activityIcon: getIconByType(a.tipo),
  }));

  // ESTILOS DARK MODE (Fondos translúcidos + Texto brillante)
  const activityTypeStyles = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    critical: "bg-red-500/10 text-red-400 border border-red-500/20",
    info: "bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/20",
  };

  const alertTypeStyles = {
    critical: "bg-red-900/10 border-red-500/30 text-red-300 hover:bg-red-900/20",
    warning: "bg-amber-900/10 border-amber-500/30 text-amber-300 hover:bg-amber-900/20",
    info: "bg-[#2A9D8F]/10 border-[#2A9D8F]/30 text-[#2A9D8F] hover:bg-[#2A9D8F]/20",
  };

  const priorityBadgeStyles = {
    Urgente: "bg-red-500/20 text-red-400 border-red-500/30",
    Alta: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Media: "bg-[#2A9D8F]/20 text-[#2A9D8F] border-[#2A9D8F]/30",
    Baja: "bg-gray-700/50 text-gray-400 border-gray-600",
  };

  if (loading && alertas.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-12 gap-3">
        <RefreshCcw className="h-8 w-8 text-[#2A9D8F] animate-spin" />
        <p className="text-gray-400 text-sm">Sincronizando alertas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#13161C] rounded-2xl border border-red-900/50">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-red-400 mb-4 text-center">No se pudieron cargar las alertas.</p>
        <Button onClick={loadAlertas} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
          Reintentar conexión
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      
      {/* 1. Tarjeta de Actividad Reciente */}
      <Card className="bg-[#13161C] border border-white/10 shadow-lg shadow-black/20">
        <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-white/5">
          <div>
            <CardTitle className="flex items-center gap-2 text-white font-['Outfit'] text-lg">
              <Activity className="h-5 w-5 text-[#2A9D8F]" />
              Actividad Reciente
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs mt-1">
              Monitoreo en tiempo real del sistema
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#2A9D8F] hover:text-white hover:bg-[#2A9D8F]/10 gap-2 transition-colors"
            onClick={loadAlertas}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {actividadReciente.map((activity, index) => {
            const Icon = activity.activityIcon;
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${activityTypeStyles[activity.activityType]}`}
              >
                <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-bold leading-tight mb-1">{activity.activityTitle}</p>
                  <p className="text-[11px] opacity-80 line-clamp-2 leading-snug">
                    {activity.activityDescription}
                  </p>
                  <p className="text-[10px] mt-2 font-mono opacity-60 uppercase">
                    {activity.activityTime}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 2. Alertas Importantes */}
      <Card className="bg-[#13161C] border border-white/10 shadow-lg shadow-black/20">
        <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-white font-['Outfit'] text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alertas Prioritarias
          </CardTitle>
          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3">
            {alertasImportantes.length} Pendientes
          </Badge>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {alertasImportantes.length > 0 ? (
            alertasImportantes.map((alert, index) => (
              <div
                key={index}
                className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300 ${alertTypeStyles[getAlertType(alert.prioridad)]}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-bold text-white">{alert.titulo}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityBadgeStyles[alert.prioridad]}`}
                  >
                    {alert.prioridad}
                  </Badge>
                </div>
                
                <p className="text-xs opacity-80 leading-relaxed min-h-[2.5em]">
                    {alert.descripcion}
                </p>
                
                <div className="flex justify-end mt-auto">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs border-white/10 hover:bg-white/10 text-white hover:text-white bg-transparent"
                    >
                    {alert.accion || "Revisar"}
                    </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-12 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
              <CheckCircle className="h-10 w-10 mb-3 opacity-20" />
              <p>Todo está bajo control</p>
              <p className="text-xs opacity-60">No hay alertas urgentes pendientes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Resumen de Personal (Card con Gradiente de Marca) */}
      <Card className="border-0 overflow-hidden relative">
        {/* Fondo Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F]" />
        
        {/* Decoración circular */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

        <CardContent className="relative flex flex-col sm:flex-row gap-6 p-6 items-center">
          <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md text-white shadow-inner border border-white/10">
            <Users className="h-8 w-8" />
          </div>
          
          <div className="flex flex-col flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white font-['Outfit']">Estado del Sistema RH</h3>
            <p className="text-teal-100 text-sm mt-1 font-light">
              Resumen operativo actualizado en tiempo real.
            </p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 text-xs font-medium text-white bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 Sistema Operativo
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-white bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                 <AlertTriangle className="w-3 h-3 text-amber-400" />
                 {alertas.length} Alertas Totales
              </div>
            </div>
          </div>
          
          <div className="hidden md:block pr-8 opacity-20">
             <Activity className="h-24 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Funciones Helper ---
function getActivityType(prioridad) {
  const map = {
    Urgente: "critical",
    Alta: "warning",
    Media: "info",
    Baja: "success",
  };
  return map[prioridad] || "info";
}

function getAlertType(prioridad) {
  const map = {
    Urgente: "critical",
    Alta: "warning",
    Media: "info",
    Baja: "info",
  };
  return map[prioridad] || "info";
}

function getIconByType(tipo) {
  const icons = {
    request: Calendar,
    shift: Clock,
    document: FileText,
    training: FileText,
    payroll: CheckCircle,
  };
  return icons[tipo] || AlertTriangle;
}

function formatFecha(fecha) {
  if (!fecha) return "Hace un momento";
  const date = new Date(fecha);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export default AlertsPanel;