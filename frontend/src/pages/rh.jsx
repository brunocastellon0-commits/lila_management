import React, { useState } from "react";
import { Users, UserPlus, GraduationCap, Shield, Settings, HelpCircle, Menu, Bell, AlertCircle, Clock, CheckCircle, Activity } from "lucide-react";
import { Button } from "../assets/components/ui/button";

// ============================================
// IMPORTAR COMPONENTES
// ============================================
import { Sidebar } from "../assets/components/rh/sidebar";
import { Header } from "../assets/components/rh/header";
import GestionNominaContent from "../assets/components/rh/gestion_nomina";
import { RegistrarEmpleadoForm } from "../assets/components/rh/registrar_Empleado_form";
import ScheduleContent from "../assets/components/rh/schedule_employee";
import GestionReclutamientoContent from "../assets/components/rh/reclutamiento";
import CapacitacionContent from "../assets/components/rh/capacitacion";
import CumplimientoLegalContent from "../assets/components/rh/cumplimiento_legal";
// ============================================
// DASHBOARD CONTENT (REFACTORIZADO DARK MODE)
// ============================================
function DashboardContent() {
  return (
    <div className="p-8 space-y-6">
      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-[#2A9D8F]/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Empleados</h3>
            <div className="p-2 rounded-xl bg-[#2A9D8F]/10 group-hover:bg-[#2A9D8F]/20 transition-colors">
                <Users className="h-5 w-5 text-[#2A9D8F]" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white font-['Outfit']">248</p>
          <div className="flex items-center gap-2 mt-2">
             <span className="text-sm text-emerald-400 font-bold">↑ 12%</span>
             <span className="text-xs text-gray-500">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-blue-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nuevos Ingresos</h3>
            <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <UserPlus className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white font-['Outfit']">15</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">En el último mes</p>
        </div>

        <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">En Capacitación</h3>
            <div className="p-2 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <GraduationCap className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white font-['Outfit']">32</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Programas activos</p>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-[#13161C] p-8 rounded-[2rem] border border-white/10 shadow-xl shadow-black/20">
        <h3 className="text-xl font-bold text-white mb-6 font-['Outfit'] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2A9D8F]" />
            Actividad Reciente
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[#2A9D8F]/30 transition-colors">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shadow-[0_0_8px_#10B981]"></div>
            <div className="flex-1">
                <p className="text-sm text-gray-200 font-medium">Juan Pérez fue contratado como Chef</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Hace 2 horas
                </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shadow-[0_0_8px_#3B82F6]"></div>
            <div className="flex-1">
                <p className="text-sm text-gray-200 font-medium">Capacitación de seguridad alimentaria completada</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Ayer
                </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 shadow-[0_0_8px_#F59E0B]"></div>
            <div className="flex-1">
                <p className="text-sm text-gray-200 font-medium">Revisión de nómina pendiente</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Hace 1 día
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Inferior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#13161C] p-8 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20">
          <h3 className="text-lg font-bold text-white mb-6 font-['Outfit']">Accesos Rápidos</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5 hover:text-white h-12 rounded-xl">
              <Users className="w-4 h-4 mr-3 text-[#2A9D8F]" />
              Gestión de Empleados
            </Button>
            <Button variant="outline" className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5 hover:text-white h-12 rounded-xl">
              <UserPlus className="w-4 h-4 mr-3 text-blue-400" />
              Nuevo Reclutamiento
            </Button>
            <Button variant="outline" className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5 hover:text-white h-12 rounded-xl">
              <GraduationCap className="w-4 h-4 mr-3 text-purple-400" />
              Programas de Capacitación
            </Button>
          </div>
        </div>

        <div className="bg-[#13161C] p-8 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20">
          <h3 className="text-lg font-bold text-white mb-6 font-['Outfit']">Próximas Tareas</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-200">Revisión de desempeño</p>
                <p className="text-xs text-rose-400 font-medium">Vence en 2 días</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-200">Actualizar políticas</p>
                <p className="text-xs text-amber-400 font-medium">Vence en 5 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PLACEHOLDER COMPONENTS (REFACTORIZADO DARK MODE)
// ============================================
function PlaceholderContent({ title, icon: Icon }) {
  return (
    <div className="p-8 h-full">
      <div className="flex flex-col items-center justify-center h-[500px] bg-[#13161C] rounded-[2rem] border border-white/10 shadow-inner">
        <div className="p-6 bg-[#0c0e12] rounded-full border border-white/5 mb-6 shadow-lg shadow-black/40">
            <Icon className="h-16 w-16 text-[#2A9D8F] opacity-80" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 font-['Outfit']">{title}</h2>
        <p className="text-gray-500 font-medium">Este módulo está en desarrollo</p>
        <div className="mt-8 h-1 w-24 bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] rounded-full opacity-50"></div>
      </div>
    </div>
  );
}

// ============================================
// MAIN RH COMPONENT (CONTAINER DARK)
// ============================================
export default function Rrhh() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");

  const handleModuleSelect = (moduleId) => {
    setActiveModule(moduleId);
    setSidebarOpen(false);
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Función para renderizar el contenido
  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardContent />;
      case "gestionAdministrativa":
        return <GestionNominaContent />;
      case "reclutamiento":
        return <GestionReclutamientoContent />;
      case "capacitacion":
        return <CapacitacionContent />;
      case "cumplimiento":
        return <CumplimientoLegalContent />;
      case "configuracion":
        return <PlaceholderContent title="Configuración" icon={Settings} />;
      case "ayuda":
        return <PlaceholderContent title="Ayuda" icon={HelpCircle} />;
      case "horario":
        return <ScheduleContent />;
      default:
        return <DashboardContent />;
    }
  };

  // Función para obtener el título y subtítulo
  const getPageInfo = () => {
    const titles = {
      dashboard: { title: "La Bourboneria", subtitle: "Resumen general de RRHH" },
      gestionAdministrativa: { title: "Gestión y Nómina", subtitle: "Administración de personal" },
      reclutamiento: { title: "Reclutamiento", subtitle: "Proceso de contratación" },
      capacitacion: { title: "Capacitación", subtitle: "Desarrollo del personal" },
      cumplimiento: { title: "Cumplimiento Legal", subtitle: "Normativas y regulaciones" },
      configuracion: { title: "Configuración", subtitle: "Preferencias del sistema" },
      ayuda: { title: "Ayuda", subtitle: "Soporte y documentación" },
      schedule: { title: "Gestión de Horarios", subtitle: "Control de turnos del personal" },
    };
    return titles[activeModule] || titles.dashboard;
  };

  const pageInfo = getPageInfo();

  return (
    // CAMBIO: Fondo principal negro mate (#0c0e12)
    <div className="flex h-screen bg-[#0c0e12] overflow-hidden">
      {/* Sidebar - Contenedor con borde oscuro */}
      <div className={`${sidebarOpen ? "block" : "hidden"} lg:block w-64 border-r border-white/10 bg-[#0c0e12]`}>
        <Sidebar onModuleSelect={handleModuleSelect} activeModule={activeModule} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0c0e12]">
        <Header
          pageTitle={pageInfo.title}
          pageSubtitle={pageInfo.subtitle}
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2A9D8F]/20 scrollbar-track-transparent">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}