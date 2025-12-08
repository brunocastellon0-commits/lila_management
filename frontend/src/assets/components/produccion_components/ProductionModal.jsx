import React, { useState } from "react";
import { X, PackagePlus, ChevronDown, Layers, Scale, Factory } from "lucide-react";

// --- Importaciones de Componentes de UI REALES ---
// Se mantienen las importaciones originales, asumiendo que aceptan className (standard behavior)
import { Button } from "../ui/button"; 
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "../ui/dialog"; 

// --- Componente de Negocio: Modal de Registro de Producción ---

export function ProductionModal({ open, onOpenChange }) {
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [waste, setWaste] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Lógica INTACTA
    console.log("Datos de Lote Enviados:", {
      product,
      quantity: Number(quantity),
      waste: Number(waste),
    });
    
    console.log(`Lote registrado: Producto: ${product}, Cantidad: ${quantity}, Merma: ${waste}kg`);

    // Resetear form y cerrar
    setProduct("");
    setQuantity("");
    setWaste("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent:
         - Fondo: #13161C (Gris Oscuro/Tarjeta)
         - Borde: white/10 (Sutil)
         - Texto: Blanco
         - Sombra: Teal Glow
      */}
      <DialogContent className="sm:max-w-[500px] bg-[#13161C] border border-white/10 text-gray-100 shadow-[0_0_50px_-12px_rgba(42,157,143,0.2)] rounded-[2rem] p-0 overflow-hidden gap-0">
        
        {/* Header con gradiente sutil de fondo */}
        <div className="bg-gradient-to-b from-white/5 to-transparent px-6 py-6 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Factory className="w-5 h-5 text-[#2A9D8F]" />
                Registrar Producción
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Ingresa los detalles técnicos del lote producido para trazabilidad.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          
          {/* Grupo: Producto */}
          <div className="space-y-2">
            <Label htmlFor="product" className="text-xs uppercase tracking-wider font-semibold text-[#2A9D8F]">
                Producto
            </Label>
            <div className="relative group">
              <select
                id="product"
                className="flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-[#0c0e12] px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] focus:border-transparent appearance-none transition-all group-hover:border-white/20"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              >
                <option value="" disabled className="bg-[#13161C] text-gray-500">Selecciona un producto...</option>
                <option value="croissants" className="bg-[#13161C]">Croissants</option>
                <option value="cafe" className="bg-[#13161C]">Café Tostado Medio</option>
                <option value="ciabatta" className="bg-[#13161C]">Pan Ciabatta</option>
                <option value="pickles" className="bg-[#13161C]">Pickles Artesanales</option>
                <option value="salsa" className="bg-[#13161C]">Salsa de Tomate</option>
                <option value="bagels" className="bg-[#13161C]">Bagels Integrales</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 group-hover:text-[#2A9D8F] transition-colors">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Grupo: Cantidad */}
            <div className="space-y-2">
                <Label htmlFor="quantity" className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-gray-400">
                    <Layers className="w-3 h-3" /> Cantidad
                </Label>
                <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="h-12 bg-[#0c0e12] border-white/10 text-white placeholder:text-gray-700 focus:border-[#2A9D8F] focus:ring-[#2A9D8F] rounded-xl"
                />
            </div>

            {/* Grupo: Mermas */}
            <div className="space-y-2">
                <Label htmlFor="waste" className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-gray-400">
                    <Scale className="w-3 h-3" /> Mermas (kg)
                </Label>
                <Input
                id="waste"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={waste}
                onChange={(e) => setWaste(e.target.value)}
                required
                className="h-12 bg-[#0c0e12] border-white/10 text-white placeholder:text-gray-700 focus:border-red-500/50 focus:ring-red-500/50 rounded-xl"
                />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 bg-transparent border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:shadow-[0_0_20px_rgba(42,157,143,0.4)] text-white border-0 rounded-xl transition-all duration-300 font-medium tracking-wide"
            >
              Guardar Lote
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Componente Demo: Aplicación Principal ---

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    // Fondo General: Negro Mate con imagen de fondo "Mesh" oscura
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0c0e12] p-4 overflow-hidden font-sans">
      
      {/* Elementos Decorativos de Fondo */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#1B4F55] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2A9D8F] rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
          {/* Patrón de grilla sutil */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      </div>

      <div className="relative z-10 text-center space-y-6 p-12 bg-[#13161C]/60 backdrop-blur-md border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/50 max-w-lg w-full">
        
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2A9D8F]/20 mb-4">
            <PackagePlus className="h-8 w-8 text-white" />
        </div>

        <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Gestión de Planta</h1>
            <p className="text-gray-400 text-lg font-light">
            Sistema de trazabilidad de lotes y control de mermas.
            </p>
        </div>
        
        <div className="pt-4">
            <Button 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
            className="w-full h-14 text-lg bg-white text-[#0c0e12] hover:bg-gray-200 border-0 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-xl transition-all font-semibold"
            >
            <PackagePlus className="mr-2 h-5 w-5" />
            Iniciar Nueva Producción
            </Button>
            <p className="mt-4 text-xs text-gray-600 uppercase tracking-widest">
                Sistema Seguro v2.4
            </p>
        </div>
      </div>

      {/* Componente Modal de Producción */}
      <ProductionModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}