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
    <header className="flex items-center justify-between h-20 px-6 bg-teal-50 border-b border-teal-200 shadow-sm relative z-20 flex-shrink-0 transition-all duration-300 hover:shadow-md">
      {/* Bloque izquierdo: Menú + título */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-teal-700" />
        </Button>

        <div>
          <h1 className="text-lg font-semibold text-teal-700 hover:text-teal-600 transition-colors">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-sm text-teal-600 opacity-80 hover:opacity-100 transition-opacity">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Bloque derecho: buscador + acciones + perfil */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Buscador (solo desktop) */}
        <div className="hidden md:flex relative items-center w-[500px] h-10 bg-teal-50 border border-teal-200 rounded-md focus-within:ring-1 focus-within:ring-teal-400 transition-all">
          {/* Lupa */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700 w-4 h-4 pointer-events-none" />

          {/* Input */}
          <Input
            placeholder="Buscar empleados, reportes..."
            className="flex-1 h-full text-sm text-teal-800 bg-transparent border-none pl-10 pr-3 focus:outline-none"
          />
        </div>

        {/* Botón de búsqueda móvil */}
        <Button variant="ghost" size="sm" className="md:hidden">
          <Search className="h-5 w-5 text-teal-700" />
        </Button>

        {/* Notificaciones */}
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-teal-100 transition"
        >
          <Bell className="h-5 w-5 text-teal-700 hover:text-teal-900 transition-colors" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[0.65rem] font-semibold rounded-full bg-red-500 text-white animate-pulse">
              {notifications.length}
            </Badge>
          )}
        </Button>

        {/* Configuración (desktop) */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex hover:bg-teal-100 transition"
        >
          <Settings className="h-5 w-5 text-teal-700 hover:text-teal-900 transition-colors" />
        </Button>

        {/* Perfil de usuario */}
        <div className="flex items-center gap-2 ml-2 hover:scale-105 transition-transform">
          <Avatar className="h-9 w-9">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} />
            ) : (
              <AvatarFallback className="bg-teal-600 text-white text-xs font-semibold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-teal-800">{user.name}</p>
            {user.role && (
              <p className="text-xs text-teal-600">{user.role}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;