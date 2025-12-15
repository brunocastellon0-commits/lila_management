import React, { useState } from "react";
import { Users, UserPlus, GraduationCap, Shield, Settings, HelpCircle, Menu, Bell, AlertCircle, Clock, CheckCircle, Activity, Loader2 } from "lucide-react";
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
// DASHBOARD CONTENT (CON DATOS REALES DEL BACKEND)
// ============================================
import { useDashboardStats } from "../api/useDashboardStats";

function DashboardContent() {
  const { stats, recentActivity, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#2A9D8F] mx-auto mb-4" />
          <p className="text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error al cargar datos</h3>
          <p className="text-gray-400">No se pudieron obtener las estadísticas del dashboard</p>
        </div>
      </div>
    );
  }

  // Helper para obtener el icono de actividad
  const getActivityIcon = (type) => {
    switch(type) {
      case 'hire': return CheckCircle;
      case 'training': return GraduationCap;
      case 'alert': return AlertCircle;
      default: return Clock;
    }
  };

  // Helper para el color
  const getActivityColor = (color) => {
    const colors = {
      emerald: { dot: 'bg-emerald-500 shadow-[0_0_8px_#10B981]', border: 'hover:border-emerald-500/30' },
      blue: { dot: 'bg-blue-500 shadow-[0_0_8px_#3B82F6]', border: 'hover:border-blue-500/30' },
      amber: { dot: 'bg-amber-500 shadow-[0_0_8px_#F59E0B]', border: 'hover:border-amber-500/30' },
      rose: { dot: 'bg-rose-500 shadow-[0_0_8px_#EF4444]', border: 'hover:border-rose-500/30' }
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="p-8 space-y-6">
      {/* KPI GRID - DATOS REALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-[#2A9D8F]/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Empleados</h3>
            <div className="p-2 rounded-xl bg-[#2A9D8F]/10 group-hover:bg-[#2A9D8F]/20 transition-colors">
                <Users className="h-5 w-5 text-[#2A9D8F]" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white font-['Outfit']">{stats.totalEmployees}</p>
          <div className="flex items-center gap-2 mt-2">
             <span className={`text-sm font-bold ${stats.employeeGrowth > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
               {stats.employeeGrowth > 0 ? `↑ ${stats.employeeGrowth}%` : '—'}
             </span>
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
          <p className="text-4xl font-bold text-white font-['Outfit']">{stats.newHires}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">En el último mes</p>
        </div>

        <div className="bg-[#13161C] p-6 rounded-[2rem] border border-white/10 shadow-lg shadow-black/20 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">En Capacitación</h3>
            <div className="p-2 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <GraduationCap className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white font-['Outfit']">{stats.trainingsActive}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Programas activos</p>
        </div>
      </div>

      {/* Actividad Reciente - DATOS REALES */}
      <div className="bg-[#13161C] p-8 rounded-[2rem] border border-white/10 shadow-xl shadow-black/20">
        <h3 className="text-xl font-bold text-white mb-6 font-['Outfit'] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#2A9D8F]" />
            Actividad Reciente
        </h3>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay actividad reciente</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => {
              const colorStyles = getActivityColor(activity.color);
              const IconComponent = getActivityIcon(activity.type);
              
              return (
                <div key={index} className={`flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 ${colorStyles.border} transition-colors`}>
                  <div className={`w-2 h-2 ${colorStyles.dot} rounded-full mt-2`}></div>
                  <div className="flex-1">
                      <p className="text-sm text-gray-200 font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <IconComponent className="w-3 h-3" /> {activity.time}
                      </p>
                  </div>
                </div>
              );
            })
          )}
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
          <h3 className="text-lg font-bold text-white mb-6 font-['Outfit']">Resumen Rápido</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-gray-300">Empleados Activos</span>
              <span className="text-lg font-bold text-white">{stats.totalEmployees}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-gray-300">Capacitaciones</span>
              <span className="text-lg font-bold text-white">{stats.trainingsActive}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <span className="text-sm text-gray-300">Nuevos este mes</span>
              <span className="text-lg font-bold text-white">{stats.newHires}</span>
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