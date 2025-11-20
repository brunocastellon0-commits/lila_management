import React, { useState } from "react";
import { X, PackagePlus, ChevronDown } from "lucide-react";

// --- Importaciones de Componentes de UI REALES (Su entorno debe resolver estas rutas) ---
// Este código ASUME que tiene estos componentes en la carpeta "../ui/"
import { Button } from "../ui/button"; 
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "../ui/dialog"; 

// --- Componente de Negocio: Modal de Registro de Producción ---

/**
 * Modal para registrar los detalles de un nuevo lote de producción.
 * @param {object} props - Propiedades del componente
 * @param {boolean} props.open - Estado de apertura del diálogo
 * @param {function} props.onOpenChange - Función para cambiar el estado de apertura
 */
export function ProductionModal({ open, onOpenChange }) {
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [waste, setWaste] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Lógica para enviar los datos al backend (API, Firestore, etc.)
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

  // NOTA: Si este código se usa con un Dialog de Shadcn/ui o similar, 
  // la visibilidad está controlada por la prop 'open', no es necesario un 'if (!open) return null;'.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Producción</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del lote producido
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          <div className="space-y-2">
            <Label htmlFor="product">Producto</Label>
            {/* El select nativo está estilizado con Tailwind */}
            <div className="relative">
              <select
                id="product"
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              >
                <option value="" disabled>Selecciona un producto</option>
                <option value="croissants">Croissants</option>
                <option value="cafe">Café Tostado Medio</option>
                <option value="ciabatta">Pan Ciabatta</option>
                <option value="pickles">Pickles Artesanales</option>
                <option value="salsa">Salsa de Tomate</option>
                <option value="bagels">Bagels Integrales</option>
              </select>
              {/* Icono de flecha para el select nativo */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad Resultante</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Ej: 200"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waste">Mermas (kg)</Label>
            <Input
              id="waste"
              type="number"
              step="0.1"
              placeholder="Ej: 2.5"
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-md border-none"
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

/**
 * Componente principal que demuestra el uso de ProductionModal.
 */
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Planta de Producción</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Sistema de trazabilidad de lotes y mermas.
        </p>
        
        <Button 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-xl bg-blue-600 hover:bg-blue-700 transition-colors mt-6"
        >
          <PackagePlus className="mr-2 h-5 w-5" />
          Nueva Producción
        </Button>
      </div>

      {/* Componente Modal de Producción */}
      <ProductionModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}