import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpDown 
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
// 1. CAMBIO IMPORTANTE: Importamos los componentes correctos de 'select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "../ui/select";

// --- DATA MOCK ---
const inventoryData = [
  {
    id: "PROD-001",
    name: "Harina de Trigo Premium",
    category: "Materia Prima",
    stock: 450,
    unit: "kg",
    price: 1.20,
    status: "optimal",
    lastUpdated: "Hoy, 10:00 AM"
  },
  {
    id: "PROD-002",
    name: "Café Grano Colombia",
    category: "Tostaduría",
    stock: 12,
    unit: "kg",
    price: 18.50,
    status: "low",
    lastUpdated: "Ayer, 4:30 PM"
  },
  {
    id: "PROD-003",
    name: "Croissants Congelados",
    category: "Panadería",
    stock: 120,
    unit: "unid",
    price: 0.85,
    status: "optimal",
    lastUpdated: "Hoy, 08:15 AM"
  },
  {
    id: "PROD-004",
    name: "Frascos de Vidrio 500ml",
    category: "Insumos",
    stock: 0,
    unit: "unid",
    price: 0.45,
    status: "out",
    lastUpdated: "Hace 2 días"
  },
  {
    id: "PROD-005",
    name: "Tomates Italianos",
    category: "Frescos",
    stock: 25,
    unit: "kg",
    price: 2.10,
    status: "warning",
    lastUpdated: "Hoy, 11:20 AM"
  }
];

// Mapa de imágenes para estética visual
const productImages = {
  "Harina de Trigo Premium": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=100&q=80",
  "Café Grano Colombia": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=100&q=80",
  "Croissants Congelados": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=100&q=80",
  "Frascos de Vidrio 500ml": "https://images.unsplash.com/photo-1605330386689-53e70d45672d?auto=format&fit=crop&w=100&q=80",
  "Tomates Italianos": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=100&q=80"
};

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrado simple
  const filteredData = inventoryData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper para estilos de estado
  const getStatusStyles = (status) => {
    switch(status) {
      case 'optimal':
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
      case 'low':
        return "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
      case 'warning':
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
      case 'out':
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'optimal': return "En Stock";
      case 'low': return "Stock Crítico";
      case 'warning': return "Bajo Stock";
      case 'out': return "Agotado";
      default: return status;
    }
  };

  // Helper para manejar acciones del Select
  const handleActionChange = (value, item) => {
    console.log(`Acción ${value} ejecutada para ${item.name}`);
    // Aquí iría tu lógica (abrir modal, navegar, etc.)
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Inventario Maestro</h2>
          <p className="text-gray-400 mt-1">Gestiona existencias, precios y proveedores.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="border-white/10 bg-[#13161C] text-gray-300 hover:text-white hover:bg-white/5">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
            </Button>
            <Button className="bg-gradient-to-r from-[#1B4F55] to-[#2A9D8F] hover:shadow-[0_0_20px_rgba(42,157,143,0.4)] text-white border-0 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
            </Button>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <Card className="border border-white/10 bg-[#13161C] rounded-[2rem] shadow-2xl shadow-black/40 overflow-hidden">
        
        {/* Toolbar de Búsqueda */}
        <div className="p-5 border-b border-white/5 bg-[#0c0e12]/30 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Buscar por nombre, SKU o categoría..." 
              className="pl-10 bg-[#0c0e12] border-white/10 text-white placeholder:text-gray-600 focus:ring-[#2A9D8F] focus:border-[#2A9D8F] rounded-xl h-11 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            Mostrando <span className="text-white font-mono">{filteredData.length}</span> productos
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0c0e12]/50">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="w-[300px] text-[#2A9D8F] font-semibold uppercase text-xs tracking-wider py-5 pl-6">Producto</TableHead>
                <TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Categoría</TableHead>
                <TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                        Stock <ArrowUpDown className="w-3 h-3" />
                    </div>
                </TableHead>
                <TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Precio Unit.</TableHead>
                <TableHead className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Estado</TableHead>
                <TableHead className="text-right pr-6 text-gray-500 font-semibold uppercase text-xs tracking-wider">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    
                    {/* Producto + Imagen */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shadow-sm relative group-hover:border-[#2A9D8F]/50 transition-colors">
                            <img 
                                src={productImages[item.name]} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                          <div className="font-medium text-white group-hover:text-[#2A9D8F] transition-colors">{item.name}</div>
                          <div className="text-xs text-gray-600 font-mono">{item.id}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Categoría */}
                    <TableCell>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-gray-400 font-normal rounded-md">
                        {item.category}
                      </Badge>
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                        <div className="font-mono text-gray-300">
                           {item.stock} <span className="text-gray-600 text-xs">{item.unit}</span>
                        </div>
                    </TableCell>

                    {/* Precio */}
                    <TableCell>
                        <div className="font-medium text-white">
                            ${item.price.toFixed(2)}
                        </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge variant="outline" className={`border rounded-full px-3 py-0.5 gap-1.5 ${getStatusStyles(item.status)}`}>
                        {item.status === 'optimal' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'low' && <AlertCircle className="w-3 h-3" />}
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>

                    {/* 2. CAMBIO IMPORTANTE: Reemplazo de DropdownMenu por Select */}
                    <TableCell className="text-right pr-6">
                      <Select onValueChange={(value) => handleActionChange(value, item)}>
                        <SelectTrigger className="h-8 w-8 p-0 border-none bg-transparent hover:bg-white/10 rounded-lg flex items-center justify-center focus:ring-0 focus:ring-offset-0">
                           {/* Como SelectTrigger suele esperar un valor, pasamos el icono aquí */}
                           <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-white" />
                        </SelectTrigger>
                        <SelectContent align="end" className="bg-[#1A1D24] border-white/10 text-gray-300 rounded-xl shadow-xl">
                          <SelectGroup>
                            <SelectLabel className="text-white px-2 py-1.5 text-xs font-semibold">Acciones</SelectLabel>
                            <SelectItem value="edit" className="hover:bg-white/10 cursor-pointer">Editar Producto</SelectItem>
                            <SelectItem value="adjust_stock" className="hover:bg-white/10 cursor-pointer">Ajustar Stock</SelectItem>
                            <SelectItem value="history" className="hover:bg-white/10 cursor-pointer">Ver Historial</SelectItem>
                            <SelectItem value="delete" className="text-red-400 hover:bg-red-500/10 cursor-pointer focus:text-red-400">
                              Eliminar
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="bg-[#1A1D24] p-4 rounded-full mb-4 border border-white/5">
                            <Package className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-lg font-medium text-gray-400">No se encontraron productos</p>
                        <p className="text-sm">Prueba ajustando los filtros de búsqueda</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}