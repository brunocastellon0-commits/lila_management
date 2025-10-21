import React from "react";
import { Users, UserPlus, GraduationCap, Shield, Home, Settings, HelpCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

/* Módulos principales */
const mainModules = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "gestionAdministrativa", label: "Gestión y Nómina", icon: Users },
  { id: "reclutamiento", label: "Reclutamiento", icon: UserPlus },
  { id: "capacitacion", label: "Capacitación", icon: GraduationCap },
  { id: "registrarEmpleado", label: "Registrar Empleado", icon: UserPlus },
  { id: "cumplimiento", label: "Cumplimiento Legal", icon: Shield },
];

/* Items secundarios */
const secondaryItems = [
  { id: "configuracion", label: "Configuración", icon: Settings },
  { id: "ayuda", label: "Ayuda", icon: HelpCircle },
];

export function Sidebar({ onModuleSelect, activeModule = "dashboard" }) {
  const handleClick = (item) => {
    // Solo llamar al callback, SIN navigate
    onModuleSelect?.(item.id);
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Control</h2>
            <p className="text-xs text-gray-500">Sistema de RRHH</p>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {mainModules.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeModule;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                // CORRECCIÓN CLAVE: Uso de backticks (``)
                className={`w-full justify-start gap-3 h-11 text-sm rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-teal-500 text-white shadow-md hover:bg-teal-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleClick(item)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Separador */}
        <Separator className="my-6 bg-gray-200" />

        {/* Navegación secundaria */}
        <div className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeModule;

            return (
              <Button
                key={item.id}
                variant="ghost"
                // CORRECCIÓN CLAVE: Uso de backticks (``)
                className={`w-full justify-start gap-3 h-11 text-sm rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleClick(item)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;