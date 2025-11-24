import React, { useState } from "react";
import { Users, UserPlus, GraduationCap, Shield, Settings, HelpCircle, Menu, Bell, AlertCircle } from "lucide-react";
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

// ============================================
// DASHBOARD COMPONENT (TU DASHBOARD ORIGINAL)
// ============================================
function DashboardContent() {
  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Empleados</h3>
            <Users className="h-5 w-5 text-teal-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">248</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% vs mes anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Nuevos Ingresos</h3>
            <UserPlus className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">15</p>
          <p className="text-sm text-gray-500 mt-2">Este mes</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">En Capacitación</h3>
            <GraduationCap className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">32</p>
          <p className="text-sm text-gray-500 mt-2">Programas activos</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-700">Juan Pérez fue contratado como Chef</p>
            <span className="ml-auto text-xs text-gray-500">Hace 2 horas</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-700">Capacitación de seguridad alimentaria completada</p>
            <span className="ml-auto text-xs text-gray-500">Ayer</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm text-gray-700">Revisión de nómina pendiente</p>
            <span className="ml-auto text-xs text-gray-500">Hace 1 día</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Gestión de Empleados
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Reclutamiento
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <GraduationCap className="w-4 h-4 mr-2" />
              Programas de Capacitación
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Tareas</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Revisión de desempeño</p>
                <p className="text-xs text-gray-500">Vence en 2 días</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Actualizar políticas</p>
                <p className="text-xs text-gray-500">Vence en 5 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PLACEHOLDER COMPONENTS
// ============================================
function PlaceholderContent({ title, icon: Icon }) {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
        <Icon className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">Este módulo está en desarrollo</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN RH COMPONENT
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
        return <PlaceholderContent title="Capacitación" icon={GraduationCap} />;
      case "cumplimiento":
        return <PlaceholderContent title="Cumplimiento Legal" icon={Shield} />;
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} lg:block w-64 border-r border-gray-200`}>
        <Sidebar onModuleSelect={handleModuleSelect} activeModule={activeModule} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header
          pageTitle={pageInfo.title}
          pageSubtitle={pageInfo.subtitle}
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}