import React from "react";
import { Bell, Search, Menu, Settings } from "lucide-react";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.jsx";

export function Header({
  pageTitle,
  pageSubtitle,
  onMenuClick,
  notifications = [],
  user = { name: "Usuario", role: "", avatarUrl: "" },
}) {
  return (
    // CAMBIO: Fondo oscuro con blur (Glassmorphism), borde sutil y sticky para que acompañe el scroll
    <header className="flex items-center justify-between h-20 px-6 bg-[#0c0e12]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all duration-300 shadow-lg shadow-black/20">
      
      {/* Bloque izquierdo: Menú + título */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-gray-400 hover:text-white hover:bg-white/10"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-lg font-bold text-white font-['Outfit'] tracking-wide">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-sm text-[#2A9D8F] font-medium opacity-90">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Bloque derecho: buscador + acciones + perfil */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        
        {/* Buscador (solo desktop) - Estilo Dark Input */}
        <div className="hidden md:flex relative items-center w-[400px] h-10 bg-[#13161C] border border-white/10 rounded-full focus-within:ring-1 focus-within:ring-[#2A9D8F] focus-within:border-[#2A9D8F] transition-all">
          {/* Lupa */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />

          {/* Input */}
          <Input
            placeholder="Buscar empleados, reportes..."
            className="flex-1 h-full text-sm text-white placeholder:text-gray-600 bg-transparent border-none pl-10 pr-3 focus:outline-none"
          />
        </div>

        {/* Botón de búsqueda móvil */}
        <Button variant="ghost" size="sm" className="md:hidden text-gray-400 hover:text-white">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notificaciones */}
        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-400 hover:bg-white/10 hover:text-[#2A9D8F] transition-colors rounded-full w-10 h-10 p-0"
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center text-[0.60rem] font-bold rounded-full bg-[#2A9D8F] text-white shadow-[0_0_8px_#2A9D8F] animate-pulse border border-[#0c0e12]">
              {notifications.length}
            </Badge>
          )}
        </Button>

        {/* Configuración (desktop) */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex text-gray-400 hover:bg-white/10 hover:text-white transition-colors rounded-full w-10 h-10 p-0"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Perfil de usuario */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10 cursor-pointer group">
          <Avatar className="h-9 w-9 border border-white/10 group-hover:border-[#2A9D8F] transition-all">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} />
            ) : (
              <AvatarFallback className="bg-[#1B4F55] text-[#2A9D8F] text-xs font-bold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-white group-hover:text-[#2A9D8F] transition-colors">{user.name}</p>
            {user.role && (
              <p className="text-xs text-gray-500 uppercase tracking-wider">{user.role}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;