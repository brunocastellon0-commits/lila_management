import React from "react";
import { Card, CardContent } from "../../Ui/Card.jsx";
import { Badge } from "../../Ui/Badge.jsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/* Datos mockeados por defecto */
const exampleStats = [
  { label: "Empleados activos", value: "127", change: { value: "+3%", trend: "up" }, status: "good" },
  { label: "Turnos cubiertos", value: "89", change: { value: "-2%", trend: "down" }, status: "warning" },
  { label: "Capacitación pendiente", value: "12", change: { value: "0%", trend: "neutral" }, status: "critical" },
  { label: "Satisfacción", value: "4.2/5", status: "good" },
];

export function QuickStats({ stats = exampleStats }) {

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
