import React, { useState, useEffect } from "react";
import { Users, UserPlus, GraduationCap, Shield, Settings, HelpCircle, Menu, Bell, AlertCircle } from "lucide-react";
import { Button } from "../assets/components/ui/button";

// ============================================
// IMPORTAR COMPONENTES
// ============================================
import { Sidebar } from "../assets/components/rh/sidebar";
import GestionNominaContent from "../assets/components/rh/gestion_nomina";
import { RegistrarEmpleadoForm } from "../assets/components/rh/registrar_Empleado_form";
import ScheduleContent from "../assets/components/rh/schedule_employee";

// ============================================
// COMPONENTE DE ACCESO DENEGADO
// ============================================
function AccesoDenegado() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header 
        pageTitle="Gestión y Nómina" 
        pageSubtitle="Administración de personal" 
        onMenuClick={() => {}} 
      />
      <main className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-2">
            No tienes permisos para acceder al módulo de Recursos Humanos.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Este módulo está disponible solo para administradores del sistema.
          </p>
          <p className="text-gray-500 text-sm">
            Si necesitas acceso, contacta al administrador del sistema.
          </p>
          <Button 
            className="mt-6"
            onClick={() => window.location.href = '/schedule'}
          >
            Ir a Mi Horario
          </Button>
        </div>
      </main>
    </div>
  );
}

// ============================================
// HEADER COMPONENT
// ============================================
function Header({ pageTitle, pageSubtitle, onMenuClick }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500">{pageSubtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}

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
// MAIN RH COMPONENT CON CONTROL DE ACCESO
// ============================================
export default function Rrhh() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [showRegistrarEmpleado, setShowRegistrarEmpleado] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificación de permisos
  useEffect(() => {
    const checkPermissions = async () => {
      setTimeout(() => {
        // Buscar en múltiples claves posibles
        const possibleRoleKeys = ['role', 'userRole', 'user_role', 'user-role'];
        let userRole = 'employee';
        
        for (const key of possibleRoleKeys) {
          const value = localStorage.getItem(key);
          if (value && (value === 'admin' || value === 'administrator')) {
            userRole = 'admin';
            break;
          }
        }
        
        console.log('🔍 Debug Rrhh - Rol detectado:', userRole);
        
        setUserRole(userRole);
        setLoading(false);
      }, 500);
    };

    checkPermissions();
  }, []);

  const handleModuleSelect = (moduleId) => {
    if (!userRole || userRole !== 'admin') return;
    
    if (moduleId === "registrarEmpleado") {
      setShowRegistrarEmpleado(true);
    } else {
      setActiveModule(moduleId);
      setSidebarOpen(false);
    }
  };

  const handleMenuClick = () => {
    if (!userRole || userRole !== 'admin') return;
    setSidebarOpen(!sidebarOpen);
  };

  const closeRegistrarEmpleado = () => setShowRegistrarEmpleado(false);

  const handleEmployeeRegistered = (newEmployee) => {
    console.log("Empleado registrado:", newEmployee);
    closeRegistrarEmpleado();
  };

  // Función para renderizar el contenido según permisos
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando permisos...</p>
          </div>
        </div>
      );
    }

    // Si no es admin, mostrar acceso denegado
    if (userRole !== 'admin') {
      return <AccesoDenegado />;
    }

    // Si es admin, mostrar contenido normal
    switch (activeModule) {
      case "dashboard":
        return <DashboardContent />;
      case "gestionAdministrativa":
        return <GestionNominaContent />;
      case "reclutamiento":
        return <PlaceholderContent title="Reclutamiento" icon={UserPlus} />;
      case "capacitacion":
        return <PlaceholderContent title="Capacitación" icon={GraduationCap} />;
      case "cumplimiento":
        return <PlaceholderContent title="Cumplimiento Legal" icon={Shield} />;
      case "configuracion":
        return <PlaceholderContent title="Configuración" icon={Settings} />;
      case "ayuda":
        return <PlaceholderContent title="Ayuda" icon={HelpCircle} />;
      case "schedule":
        return <ScheduleContent />;
      default:
        return <DashboardContent />;
    }
  };

  // Función para obtener el título y subtítulo
  const getPageInfo = () => {
    if (userRole !== 'admin') {
      return { title: "Gestión y Nómina", subtitle: "Administración de personal" };
    }

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
      {/* Sidebar - Solo mostrar si es admin */}
      {userRole === 'admin' && (
        <div className={`${sidebarOpen ? "block" : "hidden"} lg:block w-64 border-r border-gray-200`}>
          <Sidebar onModuleSelect={handleModuleSelect} activeModule={activeModule} />
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {userRole === 'admin' ? (
          <>
            <Header
              pageTitle={pageInfo.title}
              pageSubtitle={pageInfo.subtitle}
              onMenuClick={handleMenuClick}
            />
            <main className="flex-1 overflow-y-auto">
              {renderContent()}
            </main>
          </>
        ) : (
          renderContent()
        )}
      </div>

      {/* Modal de Registrar Empleado - Solo si es admin */}
      {userRole === 'admin' && showRegistrarEmpleado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closeRegistrarEmpleado}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden">
            <button
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 bg-white rounded-full p-1 shadow-sm hover:shadow-md transition"
              onClick={closeRegistrarEmpleado}
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="overflow-y-auto max-h-[90vh]">
              <RegistrarEmpleadoForm 
                onSuccess={handleEmployeeRegistered}
                onCancel={closeRegistrarEmpleado}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}