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
            cardTitle: "Gestión Administrativa y Nómina",
            cardDescription:
              "Control de personal, horarios, nóminas y reportes",
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
            cardTitle: "Reclutamiento y Selección",
            cardDescription:
              "Gestión de vacantes, candidatos y procesos de selección",
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
            cardTitle: "Capacitación y Desarrollo",
            cardDescription:
              "Programas de formación, certificaciones y desarrollo",
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
            cardTitle: "Clima Laboral y Motivación",
            cardDescription:
              "Encuestas, feedback y bienestar del personal",
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
            cardTitle: "Cumplimiento Legal y Seguridad",
            cardDescription:
              "Normativas, certificados, seguridad e higiene",
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

  const getTrendIcon = (trendDirection) => {
    switch (trendDirection) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (statusType) => {
    switch (statusType) {
      case "good":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando estadísticas del dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ⚠ Error de Conexión: {error}. Se muestran datos de prueba.
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.statLabel}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.statValue}
                  </p>
                  {stat.changeData && (
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      {getTrendIcon(stat.changeData.trendDirection)}
                      <span
                        className={
                          stat.changeData.trendDirection === "up"
                            ? "text-green-600"
                            : stat.changeData.trendDirection === "down"
                            ? "text-red-600"
                            : "text-gray-500"
                        }
                      >
                        {stat.changeData.changeValue}
                      </span>
                    </div>
                  )}
                </div>
                {stat.statusType && (
                  <Badge
                    className={`px-2 py-1 rounded ${getStatusBadge(
                      stat.statusType
                    )} text-xs`}
                  >
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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Módulos del Sistema
          </h2>
          <p className="text-sm text-gray-500">
            Accede a las diferentes secciones de gestión de RRHH
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {moduleCards.map((moduleCard) => {
            const IconComponent = moduleCard.cardIcon;
            return (
              <Card
                key={moduleCard.moduleId}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 bg-white"
                onClick={() =>
                  onModuleSelect && onModuleSelect(moduleCard.moduleId)
                }
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white group-hover:shadow-lg transition-shadow duration-300">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-2 group-hover:text-teal-700 transition-colors">
                          {moduleCard.cardTitle}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {moduleCard.cardDescription}
                        </p>
                      </div>
                    </div>
                    {moduleCard.alertCount > 0 && (
                      <Badge className="text-xs animate-pulse">
                        {moduleCard.alertCount}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xl font-semibold text-gray-900">
                            {moduleCard.moduleStats.primaryStat}
                          </span>
                          {moduleCard.moduleStats.secondaryStat && (
                            <span className="text-sm text-gray-500">
                              {moduleCard.moduleStats.secondaryStat}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {moduleCard.moduleStats.statDescription}
                        </p>
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
