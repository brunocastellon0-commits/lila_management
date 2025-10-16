import React from "react";
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../../Ui/Card.jsx";
import { Badge } from "../../Ui/Badge.jsx";
import { Button } from "../../Ui/Button.jsx";

/* Mock data */
const recentActivities = [
  { activityType: "success", activityTitle: "Nómina procesada", activityDescription: "Nómina de diciembre procesada correctamente para 127 empleados", activityTime: "Hace 2 horas", activityIcon: CheckCircle },
  { activityType: "warning", activityTitle: "Certificado por vencer", activityDescription: "Certificado de manipulación de alimentos - Juan Pérez", activityTime: "Hace 4 horas", activityIcon: AlertTriangle },
  { activityType: "info", activityTitle: "Nueva capacitación", activityDescription: "Curso de atención al cliente programado para el 15 de enero", activityTime: "Hace 6 horas", activityIcon: Calendar },
  { activityType: "info", activityTitle: "Evaluación completada", activityDescription: "Evaluación de desempeño trimestral - Ana García", activityTime: "Hace 1 día", activityIcon: FileText },
];

const importantAlerts = [
  { alertType: "warning", alertTitle: "3 certificados por vencer", alertDescription: "Renovar en los próximos 15 días", priorityLevel: "Próximo", actionButton: "Ver detalles" },
  { alertType: "critical", alertTitle: "2 turnos sin cubrir", alertDescription: "Turno de mañana y tarde del viernes", priorityLevel: "Urgente", actionButton: "Gestionar" },
  { alertType: "info", alertTitle: "Revisión mensual pendiente", alertDescription: "Evaluaciones de desempeño de diciembre", priorityLevel: "Info", actionButton: "Programar" },
  { alertType: "warning", alertTitle: "Capacitación obligatoria", alertDescription: "5 empleados pendientes de completar curso de higiene", priorityLevel: "Próximo", actionButton: "Notificar" },
];

const AlertsPanel = () => {
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
    Próximo: "bg-yellow-100 text-yellow-800",
    Info: "bg-turquoise-100 text-turquoise-800",
  };

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
            <CardDescription className="text-sm text-turquoise-700">Últimas actualizaciones del sistema</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-turquoise-600 hover:text-turquoise-700">
            Ver todo
          </Button>
        </CardHeader>

        {/* Grid horizontal responsive */}
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentActivities.map((activity, index) => {
            const Icon = activity.activityIcon;
            return (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${activityTypeStyles[activity.activityType]} hover:brightness-95 transition`}>
                <div className="p-2 rounded-full bg-current text-white flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.activityTitle}</p>
                  <p className="text-xs mt-1">{activity.activityDescription}</p>
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
          <Badge className="bg-yellow-100 text-yellow-800">{importantAlerts.length}</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {importantAlerts.map((alert, index) => (
            <div key={index} className={`flex flex-col gap-2 p-4 rounded-lg border ${alertTypeStyles[alert.alertType]} hover:shadow-md transition`}>
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">{alert.alertTitle}</p>
                <Badge className={`text-xs font-semibold ${priorityBadgeStyles[alert.priorityLevel]}`}>
                  {alert.priorityLevel}
                </Badge>
              </div>
              <p className="text-xs">{alert.alertDescription}</p>
              <Button variant="outline" size="sm" className="text-xs">{alert.actionButton}</Button>
            </div>
          ))}
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
              <p className="text-sm text-turquoise-700 mt-1">127 empleados activos • 89 en turno hoy</p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-turquoise-800">
                <span>• 95% asistencia</span>
                <span>• 4.2/5 satisfacción</span>
                <span>• 6 nuevas contrataciones</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPanel;
