import { Card, CardContent } from "../ui/card";

// Objeto para manejar las clases de color (Adaptado a Dark Mode)
const colorClasses = {
  purple: {
    bg: "bg-purple-500/10", // Fondo translúcido oscuro
    border: "border-purple-500/20",
    icon: "text-purple-400",
    shadow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]", // Glow sutil
  },
  blue: {
    bg: "bg-[#2A9D8F]/10", // Usamos el Teal de marca
    border: "border-[#2A9D8F]/20",
    icon: "text-[#2A9D8F]",
    shadow: "shadow-[0_0_15px_rgba(42,157,143,0.15)]",
  },
  green: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    shadow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: "text-orange-400",
    shadow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
  },
};

/**
 * Componente de tarjeta KPI (Indicador Clave de Rendimiento).
 * @param {object} props
 * @param {string} props.title - Título del KPI.
 * @param {string} props.value - Valor principal del KPI.
 * @param {object} props.IconComponent - Componente Lucide React para el ícono.
 * @param {string} [props.trend] - Texto de tendencia (ej: "5.2%").
 * @param {boolean} [props.trendUp] - True si la tendencia es positiva.
 * @param {'purple' | 'blue' | 'green' | 'orange'} props.color - Esquema de color.
 */
export function KPICard({ title, value, IconComponent, trend, trendUp, color }) { 
  const selectedColor = colorClasses[color] || colorClasses.purple;

  return (
    // CAMBIO: Fondo oscuro (#13161C), borde sutil y sin sombra por defecto (solo glow en hover o interno)
    <Card className="border border-white/10 bg-[#13161C] hover:border-white/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide">{title}</p>
            <p className="text-white text-3xl font-bold mb-1 font-['Outfit']">{value}</p>
            
            {/* Indicador de Tendencia */}
            {trend && (
              <div className={`flex items-center text-sm font-bold ${
                trendUp ? "text-emerald-400" : "text-red-400"
              }`}>
                <span className="mr-1">{trendUp ? "↑" : "↓"}</span>
                <span>{trend}</span>
              </div>
            )}
          </div>
          
          {/* Contenedor del Ícono con colores dinámicos Dark Mode */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 group hover:scale-110 ${selectedColor.bg} ${selectedColor.border} ${selectedColor.shadow}`}>
            {IconComponent && <IconComponent className={`w-7 h-7 ${selectedColor.icon} group-hover:text-white transition-colors`} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}