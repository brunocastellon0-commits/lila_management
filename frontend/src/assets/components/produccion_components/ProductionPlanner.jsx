import React from 'react';
import { Calendar, Plus, Clock, ChefHat, CheckCircle2 } from "lucide-react";

// --- Importaciones de Componentes de UI REALES ---
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

// Actualización de paleta a Estilo Neon/Dark Mode
const categoryColors = {
  "Panadería": "border-[#00B8D4]/30 bg-[#00B8D4]/10 text-[#00B8D4] shadow-[0_0_10px_rgba(0,184,212,0.1)]",
  "Tostaduría": "border-amber-500/30 bg-amber-500/10 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  "Repostería": "border-pink-500/30 bg-pink-500/10 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.1)]",
  "Conservas": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
};

// Mapa de imágenes para mejora visual (Presentation Layer)
const productImages = {
    "Tostar Café Premium": "https://images.unsplash.com/photo-1580933073521-dc49ac0d4e6a?auto=format&fit=crop&w=100&q=80",
    "Hornear Croissants": "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=100&q=80",
    "Pasteles de Manzana": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=100&q=80",
    "Pickles Mixtos": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=100&q=80",
    "Pan Ciabatta": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=100&q=80"
};

/**
 * Componente que muestra el listado de tareas planificadas para la producción.
 */
export function ProductionPlanner() {
  return (
    <Card className="relative overflow-hidden bg-[#13161C] border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50">
      
      {/* Header con gradiente y efecto de cristal */}
      <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#13161C] to-[#0c0e12] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#2A9D8F]/10 rounded-2xl border border-[#2A9D8F]/20 shadow-[0_0_15px_rgba(42,157,143,0.15)]">
            <Calendar className="w-6 h-6 text-[#2A9D8F]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Planificador</h3>
            <p className="text-sm text-gray-500">Cronograma de producción semanal</p>
          </div>
        </div>
        
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:shadow-[0_0_20px_rgba(42,157,143,0.4)] text-white border-0 rounded-xl px-5 py-5 transition-all duration-300 font-medium"
          onClick={() => console.log("Funcionalidad de agregar producción iniciada.")} 
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Tarea
        </Button>
      </div>
      
      {/* Lista de Tareas */}
      <div className="p-6 space-y-4 bg-[#0c0e12]/50">
        {plannedData.map((item) => (
          <div 
            key={item.id} 
            className="group relative p-4 border border-white/5 bg-[#1A1D24] rounded-2xl hover:bg-[#1F232B] hover:border-[#2A9D8F]/30 hover:scale-[1.01] transition-all duration-300 shadow-md hover:shadow-lg cursor-default"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2A9D8F]/0 via-[#2A9D8F]/5 to-[#2A9D8F]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

            <div className="flex items-center gap-5 relative z-10">
              
              {/* Imagen del Producto */}
              <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                <img 
                    src={productImages[item.product]} 
                    alt={item.product}
                    className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 scale-110"
                />
              </div>

              {/* Información Principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-3 mb-1.5">
                  <span className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                    {item.product}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${categoryColors[item.category] || "border-gray-700 bg-gray-800 text-gray-400"} text-xs font-semibold px-2.5 py-0.5 rounded-md border backdrop-blur-sm`}
                  >
                    {item.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <ChefHat className="w-4 h-4 text-[#2A9D8F]" />
                        {item.quantity}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                    <span className="flex items-center gap-1.5 text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pendiente
                    </span>
                </div>
              </div>

              {/* Día / Calendario */}
              <div className="text-right pl-4 border-l border-white/5">
                <span className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#2A9D8F] bg-[#2A9D8F]/10 border border-[#2A9D8F]/20 px-3 py-2 rounded-lg group-hover:bg-[#2A9D8F] group-hover:text-[#0c0e12] transition-colors duration-300">
                  <Clock className="w-3.5 h-3.5" />
                  {item.day.toUpperCase()}
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
    // Fondo Global Dark Mode con gradiente ambiental
    <div className="min-h-screen bg-[#0c0e12] p-8 flex justify-center items-start font-sans overflow-hidden relative">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#2A9D8F] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.08] pointer-events-none"></div>

      <div className="w-full max-w-3xl relative z-10">
        <ProductionPlanner />
      </div>
    </div>
  );
}