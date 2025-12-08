import React from 'react';
import { Users, DollarSign, MapPin, Briefcase, Sparkles, Activity, TrendingUp, ShoppingBag, Megaphone, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate

// Importaciones de tus componentes
import { DashboardHeader } from "../assets/components/pagina_principal/DashboardHeader";
import { DashboardSidebar } from "../assets/components/pagina_principal/DashboardSidebar";
import { KPICard } from "../assets/components/pagina_principal/KPICard";
import { NewsCard } from "../assets/components/pagina_principal/NewsCard";

// --- COMPONENTES LOCALES ---

const WelcomeBanner = () => (
  <div className="relative w-full bg-[#13161C] rounded-[2rem] p-8 mb-8 flex items-center justify-between overflow-hidden border border-white/10 shadow-lg shadow-black/20 group">
    <div className="relative z-10 max-w-lg">
      <div className="flex items-center gap-3 mb-3">
         <div className="p-2 bg-[#2A9D8F]/10 rounded-xl border border-[#2A9D8F]/20">
          <Sparkles className="w-5 h-5 text-[#2A9D8F]" /> 
         </div>
         <h2 className="text-3xl font-bold text-white font-['Outfit']">Bienvenido a Lila Management</h2>
      </div>
      <p className="text-gray-400 text-lg font-light leading-relaxed">
        Tu centro de control para la excelencia en cafetería y panadería artesanal.
      </p>
    </div>
    
    {/* Imagen Panadería/Café */}
    <div className="hidden lg:block relative z-10">
      <div className="relative h-40 w-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transform rotate-2 transition-transform hover:rotate-0 border border-white/10 group-hover:scale-105 duration-500">
        <img 
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80" 
          alt="Artisan Bakery" 
          className="object-cover w-full h-full opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13161C] via-transparent to-transparent"></div>
        
        <div className="absolute bottom-3 left-3">
           <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-2 border border-white/10 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Producción en Vivo
           </div>
        </div>
      </div>
    </div>

    {/* Glow Ambiental */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-[#2A9D8F]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
  </div>
);

const ModuleCard = ({ title, subtitle, icon: Icon, image, path, color }) => {
    const navigate = useNavigate();
    
    return (
        <div 
            onClick={() => navigate(path)}
            className="group relative h-64 rounded-[2rem] overflow-hidden cursor-pointer border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
            {/* Imagen de Fondo */}
            <div className="absolute inset-0">
                <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
            </div>

            {/* Contenido */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/10 group-hover:bg-${color}-500/20 group-hover:border-${color}-500/30 transition-all`}>
                    <Icon className={`w-6 h-6 text-white group-hover:text-${color}-400`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 font-['Outfit']">{title}</h3>
                <p className="text-gray-300 text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">{subtitle}</p>
            </div>
        </div>
    );
};

const MarketingPreview = () => (
    <div className="bg-[#13161C] rounded-[2rem] border border-white/10 overflow-hidden relative group">
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" 
                alt="Marketing" 
                className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#13161C] via-[#13161C]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-bold uppercase tracking-wider mb-4">
                <Megaphone className="w-3 h-3" /> Campaña Activa
            </div>
            <h3 className="text-3xl font-bold text-white mb-2 font-['Outfit'] leading-tight">
                Festival del <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">Croissant Francés</span>
            </h3>
            <div className="flex gap-4 mt-6">
                <div className="text-center">
                    <p className="text-2xl font-bold text-white">2.4k</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Alcance</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                    <p className="text-2xl font-bold text-white">18%</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Conversión</p>
                </div>
            </div>
        </div>
    </div>
);

// --- PÁGINA PRINCIPAL ---

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-[#0c0e12] font-sans text-gray-200 selection:bg-[#2A9D8F] selection:text-white">
      
      <DashboardHeader />
      <DashboardSidebar />

      <main className="pt-24 pb-12 px-6 md:pl-72 max-w-7xl mx-auto relative z-0">
        
        {/* Decoración ambiental */}
        <div className="fixed top-20 left-72 w-[500px] h-[500px] bg-[#1B4F55]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* 1. Sección de Bienvenida */}
        <WelcomeBanner />

        {/* 2. Grid de KPIs (Resumen rápido) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <KPICard 
            title="Ingresos Totales" 
            value="$18,420" 
            IconComponent={DollarSign} 
            trend="12% vs. ayer" 
            trendUp={true} 
            color="green"
          />
          <KPICard 
            title="Pedidos Activos" 
            value="45" 
            IconComponent={ShoppingBag} 
            trend="5 en preparación" 
            trendUp={true} 
            color="blue"
          />
          <KPICard 
            title="Personal Turno" 
            value="12 / 15" 
            IconComponent={Users} 
            trend="3 ausencias" 
            trendUp={false} 
            color="orange"
          />
          <KPICard 
            title="Eficiencia Cocina" 
            value="94%" 
            IconComponent={Activity} 
            trend="Tiempo prom: 12m" 
            trendUp={true} 
            color="purple"
          />
        </div>

        {/* 3. Módulos Visuales (Grid Principal) */}
        <h2 className="text-xl font-bold text-white mb-6 font-['Outfit'] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#2A9D8F]" /> Áreas de Gestión
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <ModuleCard 
                title="Producción" 
                subtitle="Control de panadería y cocina"
                icon={ChefHat}
                image="https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=800&q=80"
                path="/produccion"
                color="amber"
            />
            <ModuleCard 
                title="Recursos Humanos" 
                subtitle="Gestión de talento y nómina"
                icon={Users}
                image="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80"
                path="/rh"
                color="blue"
            />
            <ModuleCard 
                title="Finanzas" 
                subtitle="Reportes y contabilidad"
                icon={TrendingUp}
                image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80"
                path="/finanzas"
                color="emerald"
            />
        </div>

        {/* 4. Sección Inferior: Marketing y Noticias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketingPreview />
            <NewsCard />
        </div>

      </main>
    </div>
  );
}