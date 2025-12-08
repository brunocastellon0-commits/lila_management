import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Bell, TrendingUp, Package } from "lucide-react";

// Datos de las novedades
const newsItems = [
  {
    id: "1",
    title: "Nueva actualización disponible",
    description: "Sistema de inventario mejorado con alertas automáticas",
    type: "update",
    date: "Hace 2 horas",
  },
  {
    id: "2",
    title: "Recordatorio: Cierre mensual",
    description: "Recuerda completar el cierre contable antes del 15 de noviembre",
    type: "reminder",
    date: "Hoy",
  },
  {
    id: "3",
    title: "Análisis de ventas mejorado",
    description: "Ahora puedes exportar reportes personalizados en múltiples formatos",
    type: "feature",
    date: "Hace 1 día",
  },
];

export function NewsCard() {
  
  // Función para obtener el ícono
  const getIcon = (type) => {
    switch (type) {
      case "update":
        return <Package className="w-4 h-4" />;
      case "reminder":
        return <Bell className="w-4 h-4" />;
      case "feature":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Función para obtener las clases de color Dark Mode
  const getBadgeColor = (type) => {
    switch (type) {
      case "update":
        // Azul/Cyan oscuro
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "reminder":
        // Naranja/Ámbar oscuro
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "feature":
        // Púrpura/Teal oscuro (Alineado a marca)
        return "bg-[#2A9D8F]/10 text-[#2A9D8F] border border-[#2A9D8F]/20";
      default:
        return "bg-gray-800 text-gray-400 border border-gray-700";
    }
  };

  return (
    // CAMBIO: Fondo oscuro (#13161C) con borde sutil
    <Card className="border border-white/10 bg-[#13161C] shadow-lg shadow-black/20">
      <CardHeader className="pb-4 border-b border-white/5">
        <CardTitle className="text-xl font-bold text-white font-['Outfit']">Últimas Novedades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {newsItems.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col gap-1 pb-4 border-b border-white/5 last:border-0 last:pb-0 group"
          >
            <div className="flex items-center gap-3">
              {/* Badge con ícono */}
              <Badge variant="outline" className={`h-8 w-8 p-0 flex items-center justify-center rounded-lg transition-colors ${getBadgeColor(item.type)}`}>
                {getIcon(item.type)}
              </Badge>
              {/* Título de la novedad */}
              <p className="text-gray-200 text-sm font-semibold group-hover:text-white transition-colors">
                {item.title}
              </p>
            </div>
            {/* Descripción y fecha */}
            <p className="text-gray-400 text-sm ml-11 leading-snug font-light">
              {item.description}
            </p>
            <p className="text-gray-600 text-xs mt-1 ml-11 font-mono">
              {item.date}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}