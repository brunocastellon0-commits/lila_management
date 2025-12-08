import React from "react";
import { cn } from "../../../utils/utils";

/**
 * Componente: Input
 * -----------------
 * Campo de entrada de texto estilizado con soporte para focus, estado deshabilitado
 * y validación de error.
 * * MODIFICADO: Se forzó el modo oscuro (bg-[#13161C] y text-white).
 */
function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Estilos base y Colores oscuros forzados
        "flex h-9 w-full min-w-0 rounded-xl border border-white/10 bg-[#13161C] px-3 py-1 text-base text-white shadow-sm transition-all " +
        // Estilos para placeholder y archivo
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white placeholder:text-gray-500 " +
        // Estilos de focus (Borde Teal/Verde cuando se selecciona)
        "focus-visible:border-[#2A9D8F] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2A9D8F] " +
        // Estilos de deshabilitado y validación
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm " +
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };