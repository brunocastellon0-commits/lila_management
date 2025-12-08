import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle } from "lucide-react";
import statsService from "../../../api/stats_Service.js";

export function QuickStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
    // Recargar cada 2 minutos (120000 ms)
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

  // CAMBIO: Colores adaptados a Dark Mode (Texto más brillante/Neón)
  const getTrendColor = (trend) => {
    switch (trend) {
      case "up": return "text-emerald-400";
      case "down": return "text-red-400";
      default: return "text-gray-500";
    }
  };

  // CAMBIO: Fondos translúcidos y bordes para Dark Mode
  const getStatusColor = (status) => {
    switch (status) {
      case "good": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "warning": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "critical": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-gray-800 text-gray-400 border border-gray-700";
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
          // Skeleton Dark Mode
          <Card key={i} className="bg-[#13161C] border border-white/10 rounded-[2rem] shadow-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-white/5 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-white/10 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && stats.length === 0) {
    return (
      // Error State Dark Mode
      <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <p className="text-red-400 text-sm font-medium">Error al cargar estadísticas: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          // CAMBIO: Estilos de tarjeta Dark Mode (Fondo gris oscuro, borde sutil, glow al hover)
          className="bg-[#13161C] border border-white/10 rounded-[2rem] shadow-lg shadow-black/20 hover:border-[#2A9D8F]/50 hover:shadow-[0_0_20px_rgba(42,157,143,0.15)] transition-all duration-300 cursor-pointer group"
        >
          <CardContent className="p-6 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 truncate group-hover:text-gray-300 transition-colors">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-white font-['Outfit'] truncate mb-1">
                {stat.value}
              </p>

              {stat.change && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${getTrendColor(stat.change.trend)}`}>
                  {getTrendIcon(stat.change.trend)}
                  <span>{stat.change.value}</span>
                </div>
              )}
            </div>

            {stat.status && (
              <Badge
                variant="outline"
                className={`flex items-center justify-center h-8 w-8 p-0 rounded-full text-xs font-bold ${getStatusColor(stat.status)}`}
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