import React from 'react';
import { Users, DollarSign, ShoppingCart, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "../ui/card";

export function KPICard({ title, value, icon: Icon, trend, color }) {
  const colorClasses = {
    cyan: "bg-[#E0F7FA] text-[#00B8D4]",
    green: "bg-green-50 text-[#00C853]",
    red: "bg-red-50 text-[#FF5252]",
    gray: "bg-gray-100 text-gray-600"
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {/* Lógica simple para detectar si el trend es positivo o negativo visualmente */}
              {trend.includes('+') ? (
                <TrendingUp className="w-3 h-3 text-[#00C853]" />
              ) : (
                <TrendingDown className="w-3 h-3 text-[#FF5252]" />
              )}
              <p className="text-xs font-medium text-gray-500">{trend}</p>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.gray}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}

// --- Implementación de ejemplo (Dashboard) ---

export default function DashboardOverview() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Ingresos Totales" 
            value="$45,231.89" 
            icon={DollarSign} 
            trend="+20.1% vs mes anterior"
            color="green" 
          />
          
          <KPICard 
            title="Nuevos Usuarios" 
            value="2,350" 
            icon={Users} 
            trend="+180.1% vs mes anterior"
            color="cyan" 
          />
          
          <KPICard 
            title="Ventas" 
            value="+12,234" 
            icon={ShoppingCart} 
            trend="+19% vs mes anterior"
            color="gray" 
          />
          
          <KPICard 
            title="Tasa de Rebote" 
            value="42.3%" 
            icon={Activity} 
            trend="-4% vs mes anterior"
            color="red" 
          />
        </div>
      </div>
    </div>
  );
}