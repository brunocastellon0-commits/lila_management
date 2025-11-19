import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"; // Asegura la ruta correcta
import { Badge } from "../ui/badge";
import { Bell, TrendingUp, Package } from "lucide-react";

// Datos de las novedades (sin tipado TypeScript)
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
  
  // Función para obtener el ícono según el tipo de novedad
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

  // Función para obtener las clases de color de la Badge según el tipo
  const getBadgeColor = (type) => {
    switch (type) {
      case "update":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "reminder":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "feature":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <Card className="border-0 shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">Últimas Novedades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {newsItems.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col gap-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-2">
              {/* Badge con ícono */}
              <Badge variant="outline" className={`h-6 px-2 py-0.5 border-0 rounded-md ${getBadgeColor(item.type)}`}>
                {getIcon(item.type)}
              </Badge>
              {/* Título de la novedad */}
              <p className="text-gray-900 text-sm font-medium">{item.title}</p>
            </div>
            {/* Descripción y fecha */}
            <p className="text-gray-600 text-sm ml-8 leading-snug">{item.description}</p>
            <p className="text-gray-400 text-xs mt-0.5 ml-8">{item.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}