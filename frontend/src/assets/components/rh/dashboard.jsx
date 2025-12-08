import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  GraduationCap,
  Heart,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";

const GATEWAY_BASE_URL = "http://localhost:7000";

// ===============================
// FUNCIONES AUXILIARES
// ===============================
const getAuthHeaders = () => {
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("supersecrethr")
      : "mock-token";

  if (!token) {
    console.error("No se encontró el token de autenticación.");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ===============================
// COMPONENTE PRINCIPAL
// ===============================
export function DashboardMain({ onModuleSelect }) {
  const [quickStats, setQuickStats] = useState([]);
  const [moduleCards, setModuleCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const mockQuickStatsFallback = [
      {
        statLabel: "Empleados (Mock)",
        statValue: "100",
        changeData: {
          changeValue: "+0",
          trendDirection: "neutral",
        },
        statusType: "good",
      },
    ];

    const mockModuleCardsFallback = [
      {
        moduleId: "mock",
        cardTitle: "Gestión Administrativa (Mock)",
        cardDescription: "Datos de prueba",
        cardIcon: Users,
        moduleStats: {
          primaryStat: "100",
          secondaryStat: "empleados",
          statDescription: "Datos de prueba",
        },
        alertCount: 0,
      },
    ];

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${GATEWAY_BASE_URL}/rh/stats/resumen`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Error al cargar datos: ${response.statusText}`);
        }

        const data = await response.json();

        const newQuickStats = [
          {
            statLabel: "Total Empleados",
            statValue: data.total_employees.toString(),
            changeData: {
              changeValue: `${data.employees_added_month} este mes`,
              trendDirection:
                data.employees_added_month > 0 ? "up" : "neutral",
            },
            statusType: "good",
          },
          {
            statLabel: "Turnos Hoy",
            statValue: data.shifts_today.toString(),
            changeData: {
              changeValue: `${data.pending_shifts} pendientes`,
              trendDirection: data.pending_shifts > 0 ? "down" : "neutral",
            },
            statusType: data.pending_shifts > 0 ? "warning" : "good",
          },
          {
            statLabel: "Capacitaciones",
            statValue: data.active_trainings.toString(),
            changeData: {
              changeValue: `${data.expiring_trainings} vencen pronto`,
              trendDirection: data.expiring_trainings > 0 ? "down" : "neutral",
            },
            statusType:
              data.expiring_trainings > 0 ? "warning" : "good",
          },
          {
            statLabel: "Cumplimiento",
            statValue: `${data.compliance_rate}%`,
            changeData: {
              changeValue: `${data.compliance_change}% vs mes anterior`,
              trendDirection:
                data.compliance_change >= 0 ? "up" : "down",
            },
            statusType:
              data.compliance_rate > 90 ? "good" : "warning",
          },
        ];

        const newModuleCards = [
          {
            moduleId: "gestionAdministrativa",
            cardTitle: "Gestión Administrativa",
            cardDescription:
              "Control de personal, horarios y nóminas",
            cardIcon: Users,
            moduleStats: {
              primaryStat: data.total_employees.toString(),
              secondaryStat: "empleados",
              statDescription: "Total de empleados activos",
            },
            alertCount: 2,
          },
          {
            moduleId: "reclutamiento",
            cardTitle: "Reclutamiento",
            cardDescription:
              "Gestión de vacantes y candidatos",
            cardIcon: UserPlus,
            moduleStats: {
              primaryStat: "8",
              secondaryStat: "vacantes",
              statDescription: "Posiciones abiertas",
            },
            alertCount: 0,
          },
          {
            moduleId: "capacitacion",
            cardTitle: "Capacitación",
            cardDescription:
              "Programas de formación y desarrollo",
            cardIcon: GraduationCap,
            moduleStats: {
              primaryStat: data.active_trainings.toString(),
              secondaryStat: "cursos",
              statDescription: "Capacitaciones activas",
            },
            alertCount: data.expiring_trainings,
          },
          {
            moduleId: "climaLaboral",
            cardTitle: "Clima Laboral",
            cardDescription:
              "Encuestas y bienestar del personal",
            cardIcon: Heart,
            moduleStats: {
              primaryStat: "4.2",
              secondaryStat: "/5.0",
              statDescription: "Satisfacción promedio",
            },
            alertCount: 0,
          },
          {
            moduleId: "cumplimiento",
            cardTitle: "Cumplimiento Legal",
            cardDescription:
              "Normativas, seguridad e higiene",
            cardIcon: Shield,
            moduleStats: {
              primaryStat: `${data.compliance_rate}%`,
              secondaryStat: "cumplimiento",
              statDescription: "Documentación al día",
            },
            alertCount: 1,
          },
        ];

        setQuickStats(newQuickStats);
        setModuleCards(newModuleCards);
        setError(null);
      } catch (err) {
        console.error("Error al obtener datos del dashboard:", err.message);
        setError(
          "No se pudieron cargar los datos del dashboard. El servicio puede estar inactivo."
        );
        setQuickStats(mockQuickStatsFallback);
        setModuleCards(mockModuleCardsFallback);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Iconos adaptados a colores neon
  const getTrendIcon = (trendDirection) => {
    switch (trendDirection) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-emerald-400" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  // Badges oscuros
  const getStatusBadge = (statusType) => {
    switch (statusType) {
      case "good":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "critical":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-gray-800 text-gray-400 border border-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A9D8F] mb-3" />
        <p className="text-sm font-medium">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Mensaje de Error */}
      {error && (
        <div className="p-4 bg-red-900/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Error de Conexión: {error}. Se muestran datos de prueba.</span>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            className="bg-[#13161C] border border-white/10 shadow-lg shadow-black/20 hover:border-white/20 transition-all duration-300"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
                    {stat.statLabel}
                  </p>
                  <p className="text-3xl font-bold text-white font-['Outfit']">
                    {stat.statValue}
                  </p>
                  
                  {stat.changeData && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {getTrendIcon(stat.changeData.trendDirection)}
                      <span
                        className={`font-medium ${
                          stat.changeData.trendDirection === "up"
                            ? "text-emerald-400"
                            : stat.changeData.trendDirection === "down"
                            ? "text-red-400"
                            : "text-gray-500"
                        }`}
                      >
                        {stat.changeData.changeValue}
                      </span>
                    </div>
                  )}
                </div>
                
                {stat.statusType && (
                  <Badge
                    variant="outline"
                    className={`px-2 py-1 rounded-md text-[10px] font-bold ${getStatusBadge(
                      stat.statusType
                    )}`}
                  >
                    {stat.statusType === "good" && "OK"}
                    {stat.statusType === "warning" && "ATENCIÓN"}
                    {stat.statusType === "critical" && "CRÍTICO"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Módulos del sistema */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 font-['Outfit']">
            Módulos del Sistema
          </h2>
          <p className="text-sm text-gray-400 font-light">
            Accede a las diferentes secciones de gestión de RRHH
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {moduleCards.map((moduleCard) => {
            const IconComponent = moduleCard.cardIcon;
            return (
              <Card
                key={moduleCard.moduleId}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-[#13161C] border border-white/10 hover:border-[#2A9D8F]/50 hover:shadow-[0_0_20px_rgba(42,157,143,0.15)] relative overflow-hidden"
                onClick={() =>
                  onModuleSelect && onModuleSelect(moduleCard.moduleId)
                }
              >
                {/* Fondo decorativo hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2A9D8F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Icono con gradiente de marca */}
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] text-white shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-200 mb-1 group-hover:text-white transition-colors">
                          {moduleCard.cardTitle}
                        </CardTitle>
                        <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors line-clamp-2">
                          {moduleCard.cardDescription}
                        </p>
                      </div>
                    </div>
                    {moduleCard.alertCount > 0 && (
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] animate-pulse">
                        {moduleCard.alertCount}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-2xl font-bold text-white font-['Outfit']">
                            {moduleCard.moduleStats.primaryStat}
                          </span>
                          {moduleCard.moduleStats.secondaryStat && (
                            <span className="text-xs text-[#2A9D8F] font-bold uppercase tracking-wider">
                              {moduleCard.moduleStats.secondaryStat}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {moduleCard.moduleStats.statDescription}
                        </p>
                      </div>
                      
                      {/* Indicador de estado visual */}
                      <div className="w-2 h-2 rounded-full bg-[#2A9D8F] shadow-[0_0_8px_#2A9D8F] group-hover:bg-[#4FD1C5] transition-colors"></div>
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