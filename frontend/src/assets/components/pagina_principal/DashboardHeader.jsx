import { Bell } from "lucide-react";
// Asegúrate de que estos paths sean correctos para tu proyecto (Shadcn UI)
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo y nombre del sistema */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-lg">LM</span>
          </div>
          <div>
            <h1 className="text-gray-900 font-semibold text-base leading-snug">Lila Management</h1>
            <p className="text-gray-500 text-xs leading-none">Sistema ERP</p>
          </div>
        </div>

        {/* Área derecha: notificaciones y usuario */}
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 transition">
            <Bell className="w-5 h-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full bg-purple-600 hover:bg-purple-600 text-white text-xs font-bold ring-2 ring-white">
              3
            </Badge>
          </Button>

          {/* Usuario */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block"> {/* Ocultar en móviles pequeños */}
              <p className="text-gray-900 text-sm leading-none">Bienvenido,</p>
              <p className="text-purple-600 text-sm font-medium leading-none mt-1">Carlos Méndez</p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-purple-300 transition-shadow hover:shadow-md">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="Avatar de usuario" />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">CM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}