import React from 'react';
import { Clock, Flame } from "lucide-react";

// --- Importaciones de Componentes de UI REALES (Su entorno debe resolver estas rutas) ---
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress"; 

// --- Data ---

const queueData = [
  {
    id: "1",
    product: "Croissants",
    quantity: 200,
    progress: 75,
    timeRemaining: "15 min",
    status: "in-progress"
  },
  {
    id: "2",
    product: "Café Tostado Medio",
    quantity: 50,
    progress: 45,
    timeRemaining: "28 min",
    status: "in-progress"
  },
  {
    id: "3",
    product: "Pan Ciabatta",
    quantity: 100,
    progress: 90,
    timeRemaining: "5 min",
    status: "finishing"
  },
  {
    id: "4",
    product: "Bagels Integrales",
    quantity: 80,
    progress: 30,
    timeRemaining: "42 min",
    status: "in-progress"
  }
];

// --- Main Component ---

/**
 * Componente que muestra la cola actual de ítems en producción.
 */
export function ProductionQueue() {
  
  // Función para determinar el color del indicador de progreso
  const getProgressIndicatorColor = (status) => {
      switch(status) {
          case 'finishing':
              return 'bg-[#00C853]'; // Verde para finalizar
          case 'in-progress':
          default:
              return 'bg-[#00B8D4]'; // Azul/Cyan para en curso
      }
  }

  return (
    <Card className="p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-[#00B8D4]" />
        <h3 className="text-lg font-semibold text-gray-900">Cola de Producción</h3>
      </div>
      
      <div className="space-y-4">
        {queueData.map((item) => (
          <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900 mb-1">{item.product}</p>
                <p className="text-sm text-gray-600">{item.quantity} unidades</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00B8D4]" />
                <span className="text-sm font-medium text-[#00B8D4]">{item.timeRemaining}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={item.progress} 
                className="h-2"
                // El componente Progress real debe aceptar la clase para el indicador
                indicatorClassName={getProgressIndicatorColor(item.status)} 
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">{item.progress}% completado</span>
                {item.status === "finishing" && (
                  <Badge className="bg-[#00C853] border-none">
                    Finalizando
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}


export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-start font-sans">
      <div className="w-full max-w-md">
        <ProductionQueue />
      </div>
    </div>
  );
}