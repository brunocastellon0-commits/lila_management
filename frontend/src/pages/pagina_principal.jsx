import React from 'react';
import { Users, DollarSign, MapPin, Briefcase } from "lucide-react";

// Importaciones de tus componentes (Ajusta la ruta según tu estructura de carpetas)
import { DashboardHeader } from "../assets/components/pagina_principal/DashboardHeader";
import { DashboardSidebar } from "../assets/components/pagina_principal/DashboardSidebar";
import { KPICard } from "../assets/components/pagina_principal/KPICard";
import { NewsCard } from "../assets/components/pagina_principal/NewsCard";

// --- Componentes locales específicos de esta página (Banner y Promo) ---

const WelcomeBanner = () => (
  <div className="relative w-full bg-white rounded-2xl p-6 mb-8 flex items-center justify-between overflow-hidden border border-gray-100 shadow-sm">
    <div className="relative z-10 max-w-lg">
      <div className="flex items-center gap-2 mb-2">
         <div className="p-1.5 bg-purple-100 rounded-lg">
          <span className="text-purple-600 text-xl">✨</span> 
         </div>
         <h2 className="text-2xl font-bold text-gray-900">Bienvenido a Lila Management</h2>
      </div>
      <p className="text-gray-500 text-base mt-1">
        El ERP que impulsa la gestión completa de tu restaurante.
      </p>
    </div>
    
    {/* Imagen decorativa */}
    <div className="hidden lg:block relative z-10">
      <div className="relative h-32 w-64 rounded-xl overflow-hidden shadow-lg transform rotate-1 transition-transform hover:rotate-0">
        <img 
          src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=600&h=300&fit=crop" 
          alt="Restaurant Management" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute bottom-3 left-3">
           <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Sistema Online
           </div>
        </div>
      </div>
    </div>
  </div>
);

const PromoCard = () => (
  <div className="w-full bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-200 flex flex-col justify-between h-full relative overflow-hidden">
    {/* Decoración de fondo */}
    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-purple-900/20 blur-2xl"></div>

    <div className="relative z-10">
      <h3 className="text-2xl font-bold mb-3">¿Qué es Lila Management?</h3>
      <p className="text-purple-100 text-sm leading-relaxed max-w-2xl mb-8 opacity-90">
        Lila Management es un ERP diseñado para optimizar la operación de restaurantes. 
        Administra recursos humanos, finanzas, producción, servicio al cliente, marketing y múltiples sucursales desde una sola plataforma unificada.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-1">Control Total</p>
              <p className="text-2xl font-bold">100%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-1">Módulos</p>
              <p className="text-2xl font-bold">6</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <p className="text-purple-200 text-xs font-medium uppercase tracking-wider mb-1">Uptime</p>
              <p className="text-2xl font-bold">99.9%</p>
          </div>
      </div>
    </div>
  </div>
);

// --- Página Principal ---

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
      
      {/* Header Global */}
      <DashboardHeader />

      {/* Sidebar Global */}
      <DashboardSidebar />

      {/* Contenido Principal */}
      <main className="pt-24 pb-12 px-6 md:pl-72 max-w-7xl mx-auto">
        
        {/* 1. Sección de Bienvenida */}
        <WelcomeBanner />

        {/* 2. Grid de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Empleados Activos" 
            value="127" 
            IconComponent={Users} 
            trend="8% vs. mes anterior" 
            trendUp={true} 
            color="purple"
          />
          <KPICard 
            title="Pedidos de Hoy" 
            value="243" 
            IconComponent={Briefcase} 
            trend="12% vs. ayer" 
            trendUp={true} 
            color="blue"
          />
          <KPICard 
            title="Ventas del Día" 
            value="$18,420" 
            IconComponent={DollarSign} 
            trend="5% vs. promedio" 
            trendUp={true} 
            color="green"
          />
          <KPICard 
            title="Sucursales Operativas" 
            value="8" 
            IconComponent={MapPin} 
            color="orange"
          />
        </div>

        {/* 3. Grid Inferior: Información del sistema y Noticias */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna ancha (2/3) */}
          <div className="lg:col-span-2 h-full">
             <PromoCard />
          </div>

          {/* Columna estrecha (1/3) */}
          <div className="lg:col-span-1 h-full">
            <NewsCard />
          </div>
        </div>

      </main>
    </div>
  );
}