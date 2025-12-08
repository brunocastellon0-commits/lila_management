import React from "react";

// Ahora aceptamos el componente "Icon" directamente
const TarjetaCaracteristica = ({ Icon, texto, gradient = "bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F]" }) => {
  return (
    <div className="group bg-[#13161C] rounded-2xl p-4 border border-white/10 hover:border-[#2A9D8F]/50 hover:shadow-[0_0_15px_rgba(42,157,143,0.2)] transition-all duration-300 cursor-pointer flex items-center gap-3">
      <div className={`w-12 h-12 rounded-full ${gradient} flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-lg shadow-black/40`}>
        {/* Renderizamos el icono de Lucide */}
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="text-gray-200 font-semibold text-base group-hover:text-white transition-colors">{texto}</div>
    </div>
  );
};

export default TarjetaCaracteristica;