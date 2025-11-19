import { Card, CardContent } from "../ui/card";

// Objeto para manejar las clases de color
const colorClasses = {
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    gradient: "from-purple-500 to-violet-600",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    gradient: "from-blue-500 to-cyan-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    gradient: "from-green-500 to-emerald-600",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "text-orange-600",
    gradient: "from-orange-500 to-amber-600",
  },
};

/**
 * Componente de tarjeta KPI (Indicador Clave de Rendimiento).
 * @param {object} props
 * @param {string} props.title - Título del KPI.
 * @param {string} props.value - Valor principal del KPI.
 * @param {object} props.IconComponent - Componente Lucide React para el ícono. (Nombre simplificado)
 * @param {string} [props.trend] - Texto de tendencia (ej: "5.2%").
 * @param {boolean} [props.trendUp] - True si la tendencia es positiva.
 * @param {'purple' | 'blue' | 'green' | 'orange'} props.color - Esquema de color.
 */
// 1. Cambiamos el nombre de la prop de 'icon' a 'IconComponent' para evitar la desestructuración con renombramiento.
// 2. Usamos 'IconComponent' como un componente React (<IconComponent />).
export function KPICard({ title, value, IconComponent, trend, trendUp, color }) { 
  const selectedColor = colorClasses[color] || colorClasses.purple;

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
            <p className="text-gray-900 text-3xl font-bold mb-1">{value}</p>
            
            {/* Indicador de Tendencia */}
            {trend && (
              <div className={`flex items-center text-sm font-medium ${
                trendUp ? "text-green-600" : "text-red-600"
              }`}>
                <span className="mr-1">{trendUp ? "↑" : "↓"}</span>
                <span>{trend}</span>
              </div>
            )}
          </div>
          
          {/* Contenedor del Ícono con colores dinámicos */}
          <div className={`w-14 h-14 rounded-2xl ${selectedColor.bg} flex items-center justify-center flex-shrink-0`}>
            {/* 3. Se usa el nuevo nombre de la prop */}
            {IconComponent && <IconComponent className={`w-7 h-7 ${selectedColor.icon}`} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}