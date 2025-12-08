import React from 'react';
import { Users, DollarSign, ShoppingCart, Activity, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card } from "../ui/card";

export function KPICard({ title, value, icon: Icon, trend, color }) {
  // Mapeo de colores adaptado al Dark Mode + Neon Style
  // Usamos fondos transparentes (bg-opacity) y bordes sutiles
  const colorStyles = {
    cyan: {
      container: "bg-[#2A9D8F]/10 border-[#2A9D8F]/20 text-[#2A9D8F] shadow-[0_0_15px_rgba(42,157,143,0.15)]",
      icon: "text-[#2A9D8F]"
    },
    green: {
      container: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]",
      icon: "text-emerald-400"
    },
    red: {
      container: "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.15)]",
      icon: "text-rose-400"
    },
    gray: {
      container: "bg-slate-500/10 border-slate-500/20 text-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.10)]",
      icon: "text-slate-300"
    }
  };

  const activeStyle = colorStyles[color] || colorStyles.gray;

  return (
    <Card className="group relative overflow-hidden bg-[#13161C]/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 cursor-default">
      
      {/* Efecto de degradado sutil en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative flex items-start justify-between z-10">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 group-hover:text-[#2A9D8F] transition-colors">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-white mb-2 tracking-tight shadow-black drop-shadow-lg">
            {value}
          </h3>
          
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`
                flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
                ${trend.includes('+') 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }
              `}>
                {trend.includes('+') ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trend.split(' ')[0]}</span> {/* Extraemos solo el porcentaje para el badge */}
              </div>
              <span className="text-xs text-gray-600 font-medium">vs mes anterior</span>
            </div>
          )}
        </div>

        {/* Contenedor del Icono con estilo Glassmorphism Neon */}
        <div className={`p-4 rounded-2xl border ${activeStyle.container} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${activeStyle.icon}`} />
        </div>
      </div>
    </Card>
  );
}

// --- Implementación de ejemplo (Dashboard) ---

export default function DashboardOverview() {
  return (
    // Fondo General: Negro Mate con una imagen de fondo abstracta (Dark Mesh Gradient)
    <div className="relative min-h-screen bg-[#0c0e12] font-sans flex flex-col justify-center overflow-hidden">
      
      {/* Imagen de Fondo Ambiental (Dark Mesh) */}
      <div className="absolute inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-20 mix-blend-screen pointer-events-none"
         />
         {/* Overlay gradiente para asegurar que el texto sea legible sobre la imagen */}
         <div className="absolute inset-0 bg-gradient-to-b from-[#0c0e12] via-[#0c0e12]/90 to-[#0c0e12]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full p-8">
        
        {/* Header del Dashboard */}
        <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-6">
            <div>
                <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">
                    Resumen <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F]">Ejecutivo</span>
                </h1>
                <p className="text-gray-400 text-sm">Métricas clave y rendimiento en tiempo real.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[#2A9D8F] text-sm font-medium hover:text-white transition-colors cursor-pointer group">
                Ver reporte completo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
        
        {/* Grid de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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