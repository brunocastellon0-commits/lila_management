import React, { useState } from "react";
import { 
  Package, 
  Factory, 
  ChefHat, 
  Truck, 
  Target, 
  Activity, 
  AlertTriangle, 
  Clock,
  Menu,
  Plus,
  User,
  Home,
  ChevronRight,
  Search,
  Construction,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";

// --- Importaciones de Componentes de UI (Reales) ---
import { Button } from "../assets/components/ui/button";
import { Card } from "../assets/components/ui/card"; 

// --- Importaciones de Componentes de Lógica (Negocio) ---
import { KPICard } from "../assets/components/produccion_components/KPIcard"; 
import { ProductionQueue } from "../assets/components/produccion_components/ProductionQueue"; 
import { ProductionPlanner } from "../assets/components/produccion_components/ProductionPlanner"; 
import { ProductionModal } from "../assets/components/produccion_components/ProductionModal"; 
import BranchMonitor from "../assets/components/produccion_components/BranchMonitor"; 
import Inventory from "../assets/components/produccion_components/inventario"; 
import Recipes from "../assets/components/produccion_components/recetas";
import Dispatch from "../assets/components/produccion_components/Dispatch";
// ============================================
// COMPONENTES AUXILIARES
// ============================================

const PlaceholderView = ({ title, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center animate-in fade-in zoom-in duration-500">
    <div className="bg-[#13161C] p-8 rounded-full border border-white/5 mb-6 shadow-[0_0_30px_rgba(42,157,143,0.1)]">
        <Icon className="w-16 h-16 text-[#2A9D8F] opacity-50" />
    </div>
    <h2 className="text-3xl font-bold text-white mb-3 tracking-tight font-['Outfit']">{title}</h2>
    <div className="flex items-center gap-2 text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
        <Construction className="w-4 h-4" />
        <p className="text-sm">Módulo en desarrollo - Sistema La Bourboneria</p>
    </div>
  </div>
);

// Contenido del Dashboard (Vista Principal de Producción)
const ProductionDashboardContent = () => (
  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
    {/* KPI Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard title="Meta Diaria" value="85%" icon={Target} trend="↑ 12% vs ayer" color="green" />
      <KPICard title="Lotes Activos" value="4" icon={Activity} trend="En proceso" color="cyan" />
      <KPICard title="Alertas Stock" value="3" icon={AlertTriangle} trend="Requiere atención" color="red" />
      <KPICard title="Despachos" value="7" icon={Clock} trend="2 urgentes" color="gray" />
    </div>

    {/* Branch Monitor - Full Width */}
    <BranchMonitor />

    {/* Production Management - Split View */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ProductionQueue />
      <ProductionPlanner />
    </div>
  </div>
);

// ============================================
// APLICACIÓN PRINCIPAL (Producción)
// ============================================

export default function Produccion() {
  // Estado
  const [activeTab, setActiveTab] = useState("production"); // 'production' es el dashboard principal
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Configuración de Navegación
  const navItems = [
    { id: "production", label: "Dashboard", icon: Factory }, // Principal
    { id: "inventory", label: "Inventario", icon: Package },
    { id: "rececetas", label: "Recetas", icon: ChefHat },
    { id: "dispatch", label: "Despacho", icon: Truck },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  // --- LÓGICA 1: OBTENER INFO DE PÁGINA (Igual que RRHH) ---
  const getPageInfo = () => {
    const titles = {
      production: { title: "Panel de Control", subtitle: "Visión general de planta" },
      inventory: { title: "Gestión de Inventario", subtitle: "Control de existencias y materia prima" },
      recipes: { title: "Recetario Maestro", subtitle: "Estandarización de productos" },
      dispatch: { title: "Centro de Despacho", subtitle: "Logística y distribución a sucursales" },
      settings: { title: "Configuración", subtitle: "Ajustes del sistema de producción" },
    };
    return titles[activeTab] || { title: "Producción", subtitle: "Sistema ERP" };
  };

  const pageInfo = getPageInfo();

  // --- LÓGICA 2: RENDERIZAR CONTENIDO (Igual que RRHH) ---
  const renderContent = () => {
    switch (activeTab) {
      case "production":
        return <ProductionDashboardContent />;
      case "inventory":
        return <Inventory />;
      case "rececetas":
        return <Recipes />;
      case "dispatch":
        return <Dispatch />;
      case "settings":
        return <PlaceholderView title="Configuración" icon={Settings} />;
      default:
        return <ProductionDashboardContent />;
    }
  };

  return (
    // Estructura Base: Flex Row, Fondo Oscuro
    <div className="flex h-screen bg-[#0c0e12] overflow-hidden font-sans text-gray-400 selection:bg-[#2A9D8F] selection:text-white relative">
      
      {/* Fondo Ambiental (Spotlights fixos) */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#1B4F55] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#2A9D8F] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
      </div>

      {/* --- SIDEBAR --- */}
      <aside 
        className={`${sidebarOpen ? "w-72" : "w-20"} bg-[#13161C] border-r border-white/5 transition-all duration-300 z-50 flex flex-col shadow-2xl shadow-black/50 relative`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between h-20">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(42,157,143,0.3)]">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div>
                  <span className="text-white font-bold tracking-tight block leading-tight font-['Outfit']">ERP</span>
                  <span className="text-[#2A9D8F] text-xs font-mono uppercase tracking-widest">Bourboneria</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] rounded-xl flex items-center justify-center">
               <Factory className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        
        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden ${
                activeTab === item.id
                  ? "bg-[#2A9D8F]/10 text-[#2A9D8F] shadow-[0_0_20px_rgba(42,157,143,0.1)]"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              } ${!sidebarOpen && "justify-center px-0"}`}
            >
              {/* Active Indicator */}
              {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2A9D8F] rounded-r-full shadow-[0_0_10px_#2A9D8F]"></div>
              )}

              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? "scale-110" : "group-hover:scale-110"}`} />
              
              {sidebarOpen && (
                  <span className={`font-medium truncate transition-all ${activeTab === item.id ? "translate-x-1" : ""}`}>
                      {item.label}
                  </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Mini (Bottom Sidebar) */}
        <div className="p-4 border-t border-white/5 mt-auto">
            {sidebarOpen ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#2A9D8F]/30 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center border-2 border-[#13161C] shadow-lg">
                        <User className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-[#2A9D8F] transition-colors truncate">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">Gerente Planta</p>
                    </div>
                    <LogOut className="w-4 h-4 text-gray-600 group-hover:text-red-400" />
                </div>
            ) : (
                <div className="flex justify-center p-2">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center border-2 border-[#13161C] cursor-pointer">
                        <User className="w-5 h-5 text-gray-300" />
                    </div>
                </div>
            )}
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#0c0e12]">
        
        {/* Header - Glassmorphism Sticky */}
        <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0c0e12]/80 border-b border-white/5 shadow-sm h-20 flex items-center">
          <div className="px-8 w-full">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-4">
                  {/* Toggle Sidebar Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-0 w-10 h-10 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>

                  {/* Dynamic Title Info */}
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight font-['Outfit']">
                        {pageInfo.title}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Home className="w-3 h-3" />
                        <ChevronRight className="w-3 h-3" />
                        <span>Producción</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#2A9D8F]">{pageInfo.subtitle}</span>
                    </div>
                  </div>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#2A9D8F] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Buscar lote o SKU..." 
                        className="h-10 pl-10 pr-4 rounded-xl bg-[#13161C] border border-white/10 text-sm text-white focus:ring-2 focus:ring-[#2A9D8F] focus:border-transparent focus:outline-none transition-all w-64 placeholder:text-gray-600"
                    />
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
                
                <Button 
                  className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:shadow-[0_0_20px_rgba(42,157,143,0.4)] text-white border-0 rounded-xl px-5 h-10 transition-all duration-300 shadow-lg font-medium"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Acción Rápida</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Aquí se renderiza dinámicamente el contenido */}
          {renderContent()}
        </main>
      </div>

      {/* Production Modal Global */}
      <ProductionModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}