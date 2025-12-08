import React from "react";
import { Users, UserPlus, GraduationCap, Shield, Home, Settings, HelpCircle, Activity } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

/* Módulos principales */
const mainModules = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "gestionAdministrativa", label: "Gestión y Nómina", icon: Users },
  { id: "reclutamiento", label: "Reclutamiento", icon: UserPlus },
  { id: "capacitacion", label: "Capacitación", icon: GraduationCap },
  { id: "horario", label: "Horarios", icon: Activity }, // Cambié UserPlus por Activity para variar icono
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
    // CAMBIO: Fondo oscuro (#0c0e12) y borde derecho sutil
    <aside className="flex h-full w-64 flex-col bg-[#0c0e12] border-r border-white/10 shadow-xl shadow-black/20">
      
      {/* Logo Area */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          {/* Icono Logo: Fondo oscuro tarjeta con borde y glow interno */}
          <div className="p-2.5 rounded-xl bg-[#13161C] border border-white/10 shadow-lg flex items-center justify-center group">
            <Users className="h-6 w-6 text-[#2A9D8F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg font-['Outfit'] tracking-wide">Control</h2>
            <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Sistema RRHH</p>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 px-4 pb-4 space-y-1">
        {mainModules.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeModule;

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start gap-3 h-12 text-sm rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
                isActive
                  // Activo: Gradiente Marca + Sombra Glow
                  ? "bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white shadow-[0_0_20px_rgba(42,157,143,0.3)] border border-white/10"
                  // Inactivo: Gris + Hover sutil
                  : "text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/5 border border-transparent"
              }`}
              onClick={() => handleClick(item)}
            >
              {/* El icono cambia de color si no está activo */}
              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-[#2A9D8F] group-hover:text-white"} transition-colors`} />
              <span className="relative z-10">{item.label}</span>
              
              {/* Decoración de borde activo a la izquierda (opcional, estilo moderno) */}
              {isActive && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"></div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer / Secundaria */}
      <div className="px-4 pb-6">
        <Separator className="my-4 bg-white/10" />

        <div className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeModule;

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start gap-3 h-11 text-sm rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white font-bold"
                    : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                }`}
                onClick={() => handleClick(item)}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-600 group-hover:text-gray-400"}`} />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;