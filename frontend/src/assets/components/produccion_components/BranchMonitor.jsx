import React, { useState } from 'react';
import { AlertCircle, Send, Factory, X, Activity, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// --- DATA (ESTRICTAMENTE INTACTA) ---
const stockData = [
  {
    product: "Croissants",
    category: "Panadería",
    central: 150,
    branchA: 25,
    branchB: 8,
    branchC: 30,
    minStock: 15
  },
  {
    product: "Café Tostado Medio",
    category: "Tostaduría",
    central: 45,
    branchA: 12,
    branchB: 3,
    branchC: 18,
    minStock: 10
  },
  {
    product: "Pan Ciabatta",
    category: "Panadería",
    central: 80,
    branchA: 5,
    branchB: 22,
    branchC: 15,
    minStock: 12
  },
  {
    product: "Salsa de Tomate",
    category: "Conservas",
    central: 120,
    branchA: 30,
    branchB: 28,
    branchC: 35,
    minStock: 20
  },
  {
    product: "Pickles Artesanales",
    category: "Conservas",
    central: 65,
    branchA: 18,
    branchB: 6,
    branchC: 25,
    minStock: 10
  }
];

// --- VISUAL ASSETS MAPPING (Capa de Presentación) ---
// Imágenes de Unsplash mapeadas por nombre para no tocar la data original
const productImages = {
  "Croissants": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=150&q=80",
  "Café Tostado Medio": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=150&q=80",
  "Pan Ciabatta": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80",
  "Salsa de Tomate": "https://images.unsplash.com/photo-1563287667-422849c31317?auto=format&fit=crop&w=150&q=80",
  "Pickles Artesanales": "https://images.unsplash.com/photo-1605330386689-53e70d45672d?auto=format&fit=crop&w=150&q=80"
};

// --- MAIN COMPONENT ---

export default function BranchMonitor() {
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const getStockStatus = (current, min) => {
    if (current < min) return "low";
    if (current < min * 1.5) return "medium";
    return "high";
  };

  const renderStockCell = (stock, minStock, centralStock, branchName, product) => {
    const status = getStockStatus(stock, minStock);
    
    return (
      <TableCell className="border-b border-white/5 py-4 align-middle">
        <div className="flex items-center gap-3">
          {/* Status Indicator Pill */}
          <div className={`
             flex items-center justify-center min-w-[3rem] py-1 px-2 rounded-lg border
             ${status === "low" 
               ? "bg-red-500/10 border-red-500/20 text-red-400" 
               : status === "medium"
               ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
               : "bg-[#2A9D8F]/10 border-[#2A9D8F]/20 text-[#2A9D8F]"
             }
          `}>
             <span className="font-mono font-bold text-sm">{stock}</span>
          </div>
          
          {status === "low" && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              {centralStock >= minStock ? (
                <Button 
                  size="sm" 
                  className="h-8 shadow-[0_0_15px_rgba(42,157,143,0.2)] hover:shadow-[0_0_20px_rgba(42,157,143,0.4)] bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] text-white border-0 transition-all duration-300 rounded-lg"
                  onClick={() => showNotification(`Enviando ${product} a ${branchName}`)}
                >
                  <Send className="w-3 h-3 mr-1.5" />
                  Enviar
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-8 border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-all duration-300 rounded-lg"
                  onClick={() => showNotification(`Iniciando producción de ${product}`)}
                >
                  <Factory className="w-3 h-3 mr-1.5" />
                  Producir
                </Button>
              )}
            </div>
          )}
        </div>
      </TableCell>
    );
  };

  return (
    // Fondo de Página: Negro Mate Profundo con un "Spotlight" verde azulado sutil detrás
    <div className="relative p-8 bg-[#0c0e12] min-h-screen font-sans text-gray-400 overflow-hidden selection:bg-[#2A9D8F] selection:text-white">
      
      {/* Background Decorative Blob */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#2A9D8F] rounded-full mix-blend-screen filter blur-[128px] opacity-[0.07] pointer-events-none"></div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="backdrop-blur-xl bg-[#13161C]/80 border border-[#2A9D8F]/30 text-white px-5 py-4 rounded-xl shadow-[0_0_40px_-10px_rgba(42,157,143,0.3)] flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#1B4F55] to-[#2A9D8F] p-2 rounded-full shadow-lg shadow-[#2A9D8F]/20">
                <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
                <p className="text-xs text-[#2A9D8F] font-bold uppercase tracking-wider">Sistema</p>
                <span className="text-sm font-medium text-gray-100">{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-white transition-colors ml-4 p-1 hover:bg-white/10 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Card Principal */}
      <Card className="relative z-10 border border-white/10 bg-[#13161C]/80 backdrop-blur-sm rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden ring-1 ring-white/5">
        
        {/* Header de la Tarjeta */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#13161C] to-[#0c0e12]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#2A9D8F]/10 rounded-2xl border border-[#2A9D8F]/20 text-[#2A9D8F]">
                <Package className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Monitor de Sucursales</h2>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    Gestión de inventario centralizada
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c0e12] border border-white/10 shadow-inner">
                <span className="w-2 h-2 bg-[#2A9D8F] rounded-full animate-pulse shadow-[0_0_10px_#2A9D8F]"></span>
                <span className="text-xs font-mono text-gray-400">ONLINE</span>
             </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0c0e12]/60 backdrop-blur-md sticky top-0 z-10">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="text-[#2A9D8F] font-bold uppercase text-[10px] tracking-[0.15em] py-6 pl-8 w-[250px]">Producto</TableHead>
                <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.15em] py-6">Categoría</TableHead>
                <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.15em] py-6">Planta Central</TableHead>
                <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.15em] py-6">Sucursal Centro</TableHead>
                <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.15em] py-6">Sucursal Norte</TableHead>
                <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.15em] py-6">Sucursal Sur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.map((item, index) => (
                <TableRow key={item.product} className="border-b border-white/5 hover:bg-white/[0.03] transition-all duration-200 group">
                  
                  {/* Celda de Producto con Imagen */}
                  <TableCell className="py-4 pl-8">
                    <div className="flex items-center gap-4">
                        <div className="relative group-hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                <img 
                                    src={productImages[item.product]} 
                                    alt={item.product}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                            {/* Pequeño glow detrás de la imagen en hover */}
                            <div className="absolute -inset-2 bg-[#2A9D8F] rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </div>
                        <div>
                            <span className="block font-semibold text-white group-hover:text-[#2A9D8F] transition-colors text-base">
                                {item.product}
                            </span>
                            <span className="text-xs text-gray-600 font-mono">ID: {1000 + index}</span>
                        </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4 align-middle">
                    <Badge 
                      variant="outline" 
                      className="border-white/5 bg-[#1A1D24] text-gray-400 hover:text-white hover:border-[#2A9D8F]/50 transition-all rounded-md px-3 py-1 font-normal text-xs uppercase tracking-wide"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                          <span className={`w-2.5 h-2.5 rounded-full block ${
                              item.central >= item.minStock * 2 
                                  ? "bg-[#2A9D8F] shadow-[0_0_10px_#2A9D8F]" 
                                  : "bg-yellow-500 shadow-[0_0_10px_#EAB308]"
                          }`}></span>
                      </div>
                      <span className="text-white font-mono text-lg">{item.central}</span>
                      <span className="text-xs text-gray-600">uds.</span>
                    </div>
                  </TableCell>

                  {renderStockCell(item.branchA, item.minStock, item.central, "Sucursal Centro", item.product)}
                  {renderStockCell(item.branchB, item.minStock, item.central, "Sucursal Norte", item.product)}
                  {renderStockCell(item.branchC, item.minStock, item.central, "Sucursal Sur", item.product)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}