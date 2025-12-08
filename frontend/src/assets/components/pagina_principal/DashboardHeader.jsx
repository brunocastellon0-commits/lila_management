import { Bell } from "lucide-react";
// Asegúrate de que estos paths sean correctos para tu proyecto (Shadcn UI)
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function DashboardHeader() {
  return (
    // CAMBIO: Fondo oscuro con blur (Glassmorphism) y borde sutil
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0c0e12]/90 backdrop-blur-md border-b border-white/10 z-50 shadow-lg shadow-black/20">
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* Logo y nombre del sistema */}
        <div className="flex items-center gap-3">
          {/* CAMBIO: Gradiente Teal/Deep Teal */}
          <div className="w-10 h-10 bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(42,157,143,0.3)]">
            <span className="text-white font-semibold text-lg font-['Outfit']">LM</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-snug font-['Outfit'] tracking-wide">
              Lila Management
            </h1>
            <p className="text-[#2A9D8F] text-xs leading-none font-medium uppercase tracking-wider">
              Sistema ERP
            </p>
          </div>
        </div>

        {/* Área derecha: notificaciones y usuario */}
        <div className="flex items-center gap-4">
          
          {/* Notificaciones */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {/* CAMBIO: Badge en Teal vibrante con anillo oscuro */}
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 rounded-full bg-[#2A9D8F] hover:bg-[#2A9D8F] text-white text-xs font-bold ring-2 ring-[#0c0e12]">
              3
            </Badge>
          </Button>

          {/* Usuario */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block"> 
              <p className="text-gray-400 text-sm leading-none">Bienvenido,</p>
              <p className="text-white text-sm font-medium leading-none mt-1">Carlos Méndez</p>
            </div>
            
            {/* CAMBIO: Avatar con borde Teal */}
            <Avatar className="w-10 h-10 border-2 border-[#2A9D8F] cursor-pointer hover:shadow-[0_0_10px_#2A9D8F] transition-all duration-300">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="Avatar de usuario" />
              <AvatarFallback className="bg-[#1B4F55] text-white font-bold">CM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}