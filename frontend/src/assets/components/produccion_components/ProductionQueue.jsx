import React from 'react';
import { Clock, Flame, Loader2, CheckCircle2 } from "lucide-react";

// --- Importaciones de Componentes de UI REALES ---
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress"; 

// --- Data (Intacta) ---

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

// --- Visual Assets Mapping (Capa de Presentación) ---
const productImages = {
    "Croissants": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=100&q=80",
    "Café Tostado Medio": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=100&q=80",
    "Pan Ciabatta": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=100&q=80",
    "Bagels Integrales": "https://images.unsplash.com/photo-1585478684894-a9e549537493?auto=format&fit=crop&w=100&q=80"
};

// --- Main Component ---

/**
 * Componente que muestra la cola actual de ítems en producción.
 */
export function ProductionQueue() {
  
  // Función actualizada para retornar clases con Efecto Glow/Neon
  const getProgressIndicatorColor = (status) => {
      switch(status) {
          case 'finishing':
              // Verde Esmeralda con Glow
              return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]'; 
          case 'in-progress':
          default:
              // Teal Corporativo con Glow
              return 'bg-[#2A9D8F] shadow-[0_0_15px_rgba(42,157,143,0.6)]'; 
      }
  }

  return (
    <Card className="border border-white/10 bg-[#13161C] rounded-[2rem] shadow-2xl shadow-black/40 overflow-hidden">
      
      {/* Header con estilo Glassmorphism y Gradiente */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#13161C] to-[#0c0e12] flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2A9D8F]/10 rounded-xl border border-[#2A9D8F]/20 shadow-[0_0_10px_rgba(42,157,143,0.2)]">
                <Flame className="w-5 h-5 text-[#2A9D8F]" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Cola de Producción</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    En tiempo real
                </p>
            </div>
        </div>
        <div className="text-right">
             <span className="text-2xl font-mono font-bold text-white/20">0{queueData.length}</span>
        </div>
      </div>
      
      <div className="p-6 space-y-4 bg-[#0c0e12]/50">
        {queueData.map((item) => (
          <div 
            key={item.id} 
            className="group relative p-4 bg-[#1A1D24] rounded-2xl border border-white/5 hover:border-[#2A9D8F]/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/50"
          >
            {/* Contenido Principal */}
            <div className="flex items-start gap-4 mb-4 relative z-10">
              
              {/* Imagen del Producto */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 shadow-md flex-shrink-0">
                  <img 
                      src={productImages[item.product]} 
                      alt={item.product}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                            {item.product}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5 tracking-wide">
                            LOTE: #202{item.id} • {item.quantity} UNIDS
                        </p>
                    </div>
                    
                    {/* Badge de Tiempo Restante */}
                    <div className="flex items-center gap-1.5 bg-[#0c0e12] border border-white/10 px-2.5 py-1 rounded-lg">
                        <Clock className={`w-3.5 h-3.5 ${item.status === 'finishing' ? 'text-emerald-400 animate-pulse' : 'text-[#2A9D8F]'}`} />
                        <span className={`text-xs font-bold font-mono ${item.status === 'finishing' ? 'text-emerald-400' : 'text-[#2A9D8F]'}`}>
                            {item.timeRemaining}
                        </span>
                    </div>
                </div>
              </div>
            </div>
            
            {/* Sección de Progreso */}
            <div className="space-y-2 relative z-10">
              {/* Barra de Progreso: Fondo oscuro para contraste */}
              <Progress 
                value={item.progress} 
                className="h-1.5 bg-black/40 rounded-full overflow-hidden"
                indicatorClassName={`${getProgressIndicatorColor(item.status)} transition-all duration-1000 ease-out`} 
              />
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium group-hover:text-gray-300 transition-colors">
                    {item.progress}% procesado
                </span>
                
                {item.status === "finishing" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] px-2 py-0.5 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Finalizando
                  </Badge>
                ) : (
                   <div className="flex items-center gap-1 text-[#2A9D8F] animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="font-medium">Procesando</span>
                   </div>
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
    // Fondo Global Dark Mode con gradiente
    <div className="min-h-screen bg-[#0c0e12] p-8 flex justify-center items-start font-sans relative overflow-hidden">
        {/* Glow Ambiental Detrás del componente */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#2A9D8F] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <ProductionQueue />
      </div>
    </div>
  );
}