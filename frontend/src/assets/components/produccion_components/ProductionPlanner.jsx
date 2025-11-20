import React from 'react';
import { Calendar, Plus } from "lucide-react";

// --- Importaciones de Componentes de UI REALES (Su entorno debe resolver estas rutas) ---
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button"; 

// --- Data & Logic ---

const plannedData = [
  {
    id: "1",
    day: "Lunes",
    product: "Tostar Café Premium",
    quantity: "50kg",
    category: "Tostaduría"
  },
  {
    id: "2",
    day: "Lunes",
    product: "Hornear Croissants",
    quantity: "300 unidades",
    category: "Panadería"
  },
  {
    id: "3",
    day: "Martes",
    product: "Pasteles de Manzana",
    quantity: "200 unidades",
    category: "Repostería"
  },
  {
    id: "4",
    day: "Martes",
    product: "Pickles Mixtos",
    quantity: "80 frascos",
    category: "Conservas"
  },
  {
    id: "5",
    day: "Miércoles",
    product: "Pan Ciabatta",
    quantity: "150 unidades",
    category: "Panadería"
  }
];

const categoryColors = {
  "Panadería": "border-[#00B8D4] bg-[#E0F7FA] text-[#00B8D4]",
  "Tostaduría": "border-amber-500 bg-amber-50 text-amber-700",
  "Repostería": "border-pink-500 bg-pink-50 text-pink-700",
  "Conservas": "border-green-500 bg-green-50 text-green-700"
};

/**
 * Componente que muestra el listado de tareas planificadas para la producción.
 */
export function ProductionPlanner() {
  return (
    <Card className="p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#00B8D4]" />
          <h3 className="text-lg font-semibold text-gray-900">Planificador de Producción</h3>
        </div>
        <Button 
          size="sm" 
          className="bg-[#00C853] hover:bg-[#00C853]/90 text-white"
          // Reemplazo de alert()
          onClick={() => console.log("Funcionalidad de agregar producción iniciada.")} 
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </Button>
      </div>
      
      <div className="space-y-3">
        {plannedData.map((item) => (
          <div 
            key={item.id} 
            className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="font-medium text-gray-900">{item.product}</span>
                  <Badge 
                    variant="outline" 
                    className={categoryColors[item.category] || "border-gray-200 bg-gray-50 text-gray-600"}
                  >
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{item.quantity}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {item.day}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- Demo Application ---

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-start font-sans">
      <div className="w-full max-w-2xl">
        <ProductionPlanner />
      </div>
    </div>
  );
}