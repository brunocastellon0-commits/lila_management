import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import statsService from "../../../api/stats_Service.js";

export function QuickStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
    // Recargar cada 2 minutos
    const interval = setInterval(loadStats, 120000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getResumenStats();
      const mappedStats = statsService.mapStatsToQuickStats(data);
      setStats(mappedStats);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando estadísticas:', err);
      // Mantener las stats anteriores si falla la actualización
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-3 w-3" />;
      case "down": return <TrendingDown className="h-3 w-3" />;
      default: return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-gray-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "good": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusSymbol = (status) => {
    switch (status) {
      case "good": return "✓";
      case "warning": return "!";
      case "critical": return "×";
      default: return "";
    }
  };

  if (loading && stats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && stats.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600 text-sm">Error al cargar estadísticas: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 mb-1 truncate">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 truncate">{stat.value}</p>

              {stat.change && (
                <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${getTrendColor(stat.change.trend)}`}>
                  {getTrendIcon(stat.change.trend)}
                  <span>{stat.change.value}</span>
                </div>
              )}
            </div>

            {stat.status && (
              <Badge
                variant="secondary"
                className={`flex items-center justify-center p-1 px-2 text-xs font-semibold rounded ${getStatusColor(stat.status)}`}
              >
                {getStatusSymbol(stat.status)}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default QuickStats;