import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, GraduationCap, Heart, Shield,
  TrendingUp, TrendingDown, Minus 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";


export function DashboardMain({ onModuleSelect }) {
  const [quickStats, setQuickStats] = useState([]);
  const [moduleCards, setModuleCards] = useState([]);

  useEffect(() => {
    const mockQuickStats = [
      { statLabel: "Total Empleados", statValue: "127", changeData: { changeValue: "+3 este mes", trendDirection: "up" }, statusType: "good" },
      { statLabel: "Turnos Hoy", statValue: "89", changeData: { changeValue: "5 pendientes", trendDirection: "neutral" }, statusType: "warning" },
      { statLabel: "Capacitaciones", statValue: "12", changeData: { changeValue: "3 vencen pronto", trendDirection: "down" }, statusType: "warning" },
      { statLabel: "Cumplimiento", statValue: "94%", changeData: { changeValue: "+2% vs mes anterior", trendDirection: "up" }, statusType: "good" }
    ];

    const mockModuleCards = [
      { moduleId: "gestionAdministrativa", cardTitle: "Gestión Administrativa y Nómina", cardDescription: "Control de personal, horarios, nóminas y reportes", cardIcon: Users, moduleStats: { primaryStat: "127", secondaryStat: "empleados", statDescription: "Total de empleados activos" }, alertCount: 2 },
      { moduleId: "reclutamiento", cardTitle: "Reclutamiento y Selección", cardDescription: "Gestión de vacantes, candidatos y procesos de selección", cardIcon: UserPlus, moduleStats: { primaryStat: "8", secondaryStat: "vacantes", statDescription: "Posiciones abiertas" }, alertCount: 0 },
      { moduleId: "capacitacion", cardTitle: "Capacitación y Desarrollo", cardDescription: "Programas de formación, certificaciones y desarrollo", cardIcon: GraduationCap, moduleStats: { primaryStat: "23", secondaryStat: "cursos", statDescription: "Capacitaciones activas" }, alertCount: 3 },
      { moduleId: "climaLaboral", cardTitle: "Clima Laboral y Motivación", cardDescription: "Encuestas, feedback y bienestar del personal", cardIcon: Heart, moduleStats: { primaryStat: "4.2", secondaryStat: "/5.0", statDescription: "Satisfacción promedio" }, alertCount: 0 },
      { moduleId: "cumplimiento", cardTitle: "Cumplimiento Legal y Seguridad", cardDescription: "Normativas, certificados, seguridad e higiene", cardIcon: Shield, moduleStats: { primaryStat: "94%", secondaryStat: "cumplimiento", statDescription: "Documentación al día" }, alertCount: 1 }
    ];

    setQuickStats(mockQuickStats);
    setModuleCards(mockModuleCards);
  }, []);

  const getTrendIcon = (trendDirection) => {
    switch (trendDirection) {
      case "up": return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down": return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (statusType) => {
    switch (statusType) {
      case "good": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-8">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.statLabel}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.statValue}</p>
                  {stat.changeData && (
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      {getTrendIcon(stat.changeData.trendDirection)}
                      <span className={stat.changeData.trendDirection === "up" ? "text-green-600" : stat.changeData.trendDirection === "down" ? "text-red-600" : "text-gray-500"}>
                        {stat.changeData.changeValue}
                      </span>
                    </div>
                  )}
                </div>
                {stat.statusType && (
                  <Badge className={`px-2 py-1 rounded ${getStatusBadge(stat.statusType)} text-xs`}>
                    {stat.statusType === "good" && "✓"}
                    {stat.statusType === "warning" && "!"}
                    {stat.statusType === "critical" && "×"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Módulos del sistema */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Módulos del Sistema</h2>
          <p className="text-sm text-gray-500">Accede a las diferentes secciones de gestión de RRHH</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {moduleCards.map((moduleCard) => {
            const IconComponent = moduleCard.cardIcon;
            return (
              <Card
                key={moduleCard.moduleId}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 bg-white"
                onClick={() => onModuleSelect && onModuleSelect(moduleCard.moduleId)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white group-hover:shadow-lg transition-shadow duration-300">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-2 group-hover:text-teal-700 transition-colors">{moduleCard.cardTitle}</CardTitle>
                        <p className="text-sm text-gray-500">{moduleCard.cardDescription}</p>
                      </div>
                    </div>
                    {moduleCard.alertCount > 0 && (
                      <Badge className="text-xs animate-pulse">{moduleCard.alertCount}</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xl font-semibold text-gray-900">{moduleCard.moduleStats.primaryStat}</span>
                          {moduleCard.moduleStats.secondaryStat && (
                            <span className="text-sm text-gray-500">{moduleCard.moduleStats.secondaryStat}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{moduleCard.moduleStats.statDescription}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-teal-500 group-hover:bg-teal-600 transition-colors"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardMain;
