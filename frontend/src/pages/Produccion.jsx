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
} from "lucide-react";

// --- Importaciones de Componentes de UI (Reales) ---
// Asumimos que Button y Card vienen de su carpeta ../ui/
import { Button } from "../assets/components/ui/button";
import { Card } from "../assets/components/ui/card"; 

// --- Importaciones de Componentes de Lógica (Negocio) ---
// Importamos los componentes que se crearon o se asumen en su estructura.
import { KPICard } from "../assets/components/produccion_components/KPIcard"; // Componente KPI refactorizado previamente
import { ProductionQueue } from "../assets/components/produccion_components/ProductionQueue"; // Componente Cola refactorizado previamente
import { ProductionPlanner } from "../assets/components/produccion_components/ProductionPlanner"; // Componente Planificador refactorizado previamente
import { ProductionModal } from "../assets/components/produccion_components/ProductionModal"; // Componente Modal refactorizado previamente
import  BranchMonitor  from "../assets/components/produccion_components/BranchMonitor.jsx"; // Asumimos un componente de monitorización de sucursales


// --- APLICACIÓN PRINCIPAL (Dashboard de Producción) ---

export default function Produccion() {
  const [activeTab, setActiveTab] = useState("production");
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: "inventory", label: "Inventario", icon: Package },
    { id: "production", label: "Producción", icon: Factory },
    { id: "recipes", label: "Recetas", icon: ChefHat },
    { id: "dispatch", label: "Despacho", icon: Truck }
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00B8D4] rounded-lg flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 font-semibold truncate">ERP Restaurante</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            // Clases ajustadas para usar Button de UI real con tamaño de icono
            className={`${sidebarOpen ? "ml-auto" : "w-full flex justify-center"} w-10 h-10 p-0 text-gray-700 hover:bg-gray-100`}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors mb-1 ${
                activeTab === item.id
                  ? "bg-[#E0F7FA] text-[#00B8D4] font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Home className="w-4 h-4 text-gray-500" />
                <span>/</span>
                <span className="font-semibold text-gray-800">Producción</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  className="bg-[#00C853] hover:bg-[#00C853]/90 text-white"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Producción
                </Button>
                
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 text-sm font-medium">Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              title="Meta Diaria de Producción"
              value="85%"
              icon={Target}
              trend="↑ 12% vs ayer"
              color="green"
            />
            <KPICard
              title="Lotes Activos"
              value="4"
              icon={Activity}
              trend="En proceso"
              color="cyan"
            />
            <KPICard
              title="Alertas Stock Bajo"
              value="3"
              icon={AlertTriangle}
              trend="Requiere atención"
              color="red"
            />
            <KPICard
              title="Despachos Pendientes"
              value="7"
              icon={Clock}
              trend="2 urgentes"
              color="gray"
            />
          </div>

          {/* Branch Monitor */}
          <div className="mb-6">
            <BranchMonitor />
          </div>

          {/* Production Management - Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductionQueue />
            <ProductionPlanner />
          </div>
        </main>
      </div>

      {/* Production Modal */}
      <ProductionModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}